export default async function MainPage() {
    try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user/hello/`;
        console.log(backendUrl);
        const res = await fetch(backendUrl,
            {
                method: 'GET'
            }
        );
        if (res.ok)
        {
            const resJson = await res.json();
            return <div>resJson</div>;
        } else {
            return <div>Error1</div>
        }
    } catch (error) {
        return <div>Error2</div>
    }
}