import { Card } from "@/components/ui/card";
export default function Content() {
    return (
        <div className="w-full h-full flex flex-col justify-start gap-y-2">
            {
                Array.from({length: 10}).map((_, index: number) => {
                    return (
                        <Card>
                            <div key={`content-${index}`} className="w-full flex justify-between px-4">
                                <div>Topic</div>
                                <a className="w-6 h-6" href="#">
                                    <img src="/PDF_file_icon.svg" alt="pdf" />
                                </a>
                            </div>
                        </Card>
                    );
                })
            }
        </div>
    );
}