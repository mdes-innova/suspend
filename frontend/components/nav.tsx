import { ThemToggle } from "./theme-toggle";

export default function Navbar() {
    return (
        <div className="absolute top-0 right-0 p-4">
            <ThemToggle />
        </div>
    );
}