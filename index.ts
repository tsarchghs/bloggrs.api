import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // const blog = await prisma.blogs.create({
  //   data: {
  //     name: "First blog",
  //     description:" Testing",
  //     logo_url: "http://localhost:3000/none.png",
  //     blogcategories: { create: { name: "Fasion " } },
  //     users: { create: { 
  //       first_name: "Gjergj",
  //       last_name: "Kadriu",
  //       email: "gjergjk71@gmail.com",
  //       password: "gjergji.123",
  //       isGuest: false
  //     } }
  //   }
  // })
  // const post = await prisma.blogpostcategories.create({
  //   data: {
  //     BlogId: 1,
  //     CategoryId: 1
  //   }
  // })
  // console.log(post)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })