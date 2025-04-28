export default function Content() {
    return (
        <div className="w-full h-full flex flex-col bg-blue-400 justify-start">
            {
                Array.from({length: 10}).map((_, index: number) => {
                    return <div key={`content-${index}`} className="w-full bg-red-400 flex justify-between">
                        <div>Topic</div>
                        <div>file</div>
                    </div>
                })
            }
        </div>
    );
}