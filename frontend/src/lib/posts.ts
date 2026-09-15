export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  displayDate: string;
};

export const POSTS: Post[] = [
  {
    slug: 'ministry-of-coal-sih-2026',
    title: 'The Ministry of Coal Is Back for SIH 2026',
    description:
      "An unofficial breakdown of SIH 2026's three Ministry of Coal problem statements (SIH26023, SIH26024, SIH26025), from the team that won the department's 2023 edition.",
    date: '2026-09-15',
    displayDate: 'September 15, 2026',
  },
];
