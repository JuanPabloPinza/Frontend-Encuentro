type Params = Promise<{ eventos: string }>;

export default async function PaginaEventos({params}: {params: Params}) {
    const {eventos} = await params;

    <h1>
        {eventos}
    </h1>
}