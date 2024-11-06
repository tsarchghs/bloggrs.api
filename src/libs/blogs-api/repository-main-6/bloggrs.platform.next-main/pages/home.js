
export async function getServerSideProps(context) {
    return {
        redirect: {
          destination: '/',
          permanent: true,
        },
      }  
}

export default function Home(){
    return (
        <>
            Home        
        </>
    )
}