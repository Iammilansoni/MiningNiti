import ChattingNavbar from "./_components/chatting-navbar"
import ChattingSidebar from "./_components/chatting-navbar-routes"

interface ChattingLayoutProps {
    children: React.ReactNode
}

export default function ChattingLayout({ children }: ChattingLayoutProps) {
    return <div className="min-h-screen h-full dark:bg-black dark:bg-opacity-80">
        <div className="md:pl-64  h-full">
            {children}
        </div>
        <div className="h-[60px] md:pl-56 fixed inset-y-0 w-full z-50 ">
            <ChattingNavbar />
        </div> <div className="hidden md:flex h-full fixed inset-y-0 z-50">
            <ChattingSidebar />
        </div>
    </div>
}
