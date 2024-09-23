'use client'

import { HomeScreen } from 'app/features/home/screen'

export default HomeScreen

// import Image from 'next/image'
// import { elysia } from 'hangouthub-elysia'

// export default async function Home() {
//   const { data, error } = await elysia.api.message.index.get()
//   const { data: data2 } = await elysia.api.id({ id: 123 }).get()
//   console.log('data: ', data)
//   console.log('data2: ', data2)
//   return (
//     <div>
//       <h1> Testing 123 </h1>
//       <h2> API data: {data} </h2>
//       <h2> API data2: {data2} </h2>
//     </div>
//   )
// }
