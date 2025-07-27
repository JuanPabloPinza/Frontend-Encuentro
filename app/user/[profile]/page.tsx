import { prisma } from "@/app/utils/db";
import LoginPage from "./login/page";

type Params = Promise<{ profile: string }>;


async function getUser() {
    const userData = await prisma.usuario.findMany({
        select: {
            nombre: true
        }
    })

    return userData;
}

export default async function ProfilePage({ params }: { params: Params }) {
    const userData = await getUser();

    return (<div>
        <h1>Hola desde {userData.map((item)=>(
            item.nombre
        ))}</h1>
    </div>    
)
}
