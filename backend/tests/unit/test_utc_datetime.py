"""
Unit tests for UtcDatetime — the shared Pydantic type that stamps naive
datetimes as UTC before serialization.

Regression coverage for a real production bug: every timestamp column in
this app is a naive Python datetime produced by datetime.utcnow() — a real
UTC instant with no tzinfo attached. A response schema built via
`Model.model_validate(orm_object)` (the `from_attributes=True` path used by
compliance audits, chat sessions/messages, prompts, and others) took that
naive datetime straight through Pydantic's own serialization, which emits
`.isoformat()` with no UTC offset suffix — e.g. "2026-09-11T09:23:34.701307"
instead of "...+00:00". The ECMAScript Date Time String Format spec parses
an offset-less date-time string as *local* time, not UTC, so a browser in
India (UTC+5:30) showed a compliance audit as completing "about 6 hours
ago" moments after it actually finished — reproduced live and used as the
basis for these fixtures.
"""

from datetime import datetime, timedelta, timezone

import pytest
from pydantic import BaseModel

from app.schemas.common import UtcDatetime

pytestmark = pytest.mark.unit


class _Model(BaseModel):
    when: UtcDatetime


class _OptionalModel(BaseModel):
    when: UtcDatetime | None = None


class TestUtcDatetimeSerialization:
    def test_naive_datetime_gets_a_utc_offset_in_the_serialized_string(self):
        # This is the exact bug: a naive datetime (what every DB column in
        # this app actually produces) must come out with an explicit "+00:00"
        # so browsers don't reinterpret it as local time.
        naive = datetime(2026, 9, 11, 9, 23, 34, 701307)
        model = _Model(when=naive)
        serialized = model.model_dump(mode="json")["when"]
        assert serialized.endswith("+00:00") or serialized.endswith("Z")

    def test_naive_datetime_round_trips_to_the_same_instant_everywhere(self):
        # The whole point: a client parsing the serialized string must land
        # on the same absolute instant regardless of the client's own
        # timezone. Simulate that by parsing the output back and comparing.
        naive = datetime(2026, 9, 11, 9, 23, 34)
        model = _Model(when=naive)
        serialized = model.model_dump(mode="json")["when"]
        reparsed = datetime.fromisoformat(serialized)
        assert reparsed.tzinfo is not None
        assert reparsed == naive.replace(tzinfo=timezone.utc)

    def test_already_aware_datetime_is_left_untouched(self):
        # A datetime that already carries a non-UTC offset (e.g. from a
        # future timezone-aware column, or a client-supplied value) must
        # not be reinterpreted or shifted — only naive values get stamped.
        aware = datetime(
            2026, 9, 11, 14, 53, 34, tzinfo=timezone(timedelta(hours=5, minutes=30))
        )
        model = _Model(when=aware)
        serialized = model.model_dump(mode="json")["when"]
        reparsed = datetime.fromisoformat(serialized)
        assert reparsed == aware

    def test_optional_field_stays_none(self):
        model = _OptionalModel(when=None)
        assert model.model_dump(mode="json")["when"] is None

    def test_optional_field_with_naive_value_still_gets_stamped(self):
        naive = datetime(2026, 9, 11, 9, 23, 34)
        model = _OptionalModel(when=naive)
        serialized = model.model_dump(mode="json")["when"]
        assert serialized.endswith("+00:00") or serialized.endswith("Z")
