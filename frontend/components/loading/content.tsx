import { Card } from "../ui/card";

export default function ContentLoading() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 
            sm:p-20 font-[family-name:var(--font-geist-sans)] h-dvh w-full overflow-hidden">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full h-full">
            <div className="w-full h-full flex flex-col justify-start gap-y-2">
                {
                    Array.from({length: 20}).map((_, index: number) => {
                        return (
                            <Card className="w-full bg-[linear-gradient(to_right,var(--card)_20%,var(--card-foreground)_49%,var(--card-foreground)_50%,var(--card-foreground)_51%,var(--card)_80%)]
                                bg-[length:400%_400%] animate-[gradient-x_8s_ease_infinite]" key={`loading-card-key-${index}`}>
                                <div key={`content-${index}`} className="w-full px-4">
                                    <a className="w-6 h-6 block" href="#">
                                    </a>
                                </div>
                            </Card>
                        );
                    })
                }
            </div>
        </main>
    </div>
    );
}