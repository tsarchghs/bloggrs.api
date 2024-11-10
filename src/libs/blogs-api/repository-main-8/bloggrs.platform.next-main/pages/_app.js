import Head from 'next/head';
import Script from "next/script";
import Footer from '../components/Footer';
import Header from '../components/Header';
import { AuthProvider } from '../lib/auth';
import "../styles/global.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import bloggrs from '../lib/bloggrs-sdk';
import parseBlocks from '../lib/bloggrs-ui';
import App from 'next/app';
import { useState } from 'react';
import { useEffect } from 'react';
import React from "react";

class MyApp extends React.Component {
  state = {
    children: []
  }
  loadChildren = async () => {
    this.setState({
      children: await parseBlocks(this.props.blocks)
    })
  }
  componentDidMount() {
    this.loadChildren();
  }
  render() {
    const { children } = this.state;
    const { Component, pageProps } = this.props;

    return (
      <AuthProvider>
        <Script 
          src="http://localhost:4444/dist/bloggrs.umd.js"
          strategy="beforeInteractive"
        />
        <Head>
          <link rel="stylesheet" href="/purecssframework.css"/>
          <title>Create Next Apps</title>
        </Head>

        {/* { children } */}
        <Script
          src="http://localhost:4444/dist/bloggrs.umd.js"
          strategy="beforeInteractive"
        />
        <Head>
          <link rel="stylesheet" href="/purecssframework.css"/>
          <title>Create Next Apps</title>
        </Head>
        <>
          <Header/>
            <div className='main-container'>
              <Component {...pageProps} />
            </div>
          <Footer/>
        </> 
        <ToastContainer/>
      </AuthProvider>
    )
  }
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  await bloggrs.initPromise;
  const blog = bloggrs.blog;
  const { blocks } = blog || { blocks: [] };
  // const children = await parseBlocks(blocks);
  // console.log({ chhhhhh: children })
  return { ...appProps, blocks }
}

// function MyApp({ Component, pageProps, blocks }) {
//   console.log({ blocks })
//   const [ children, setChildren ] = useState([])
  
//   useEffect(async () => {
//     setChildren(
//       await parseBlocks(blocks)
//     )
//   },[])

//   console.log({ children })
//   console.log("SSWWWW")
//   return (
//     <AuthProvider>
//       <Script 
//         src="http://localhost:4444/dist/bloggrs.umd.js"
//         strategy="beforeInteractive"
//       />
//       { children }
//       {/* <Script 
//         src="http://localhost:4444/dist/bloggrs.umd.js"
//         strategy="beforeInteractive"
//       />
//       <Head>
//         <link rel="stylesheet" href="/purecssframework.css"/>
//         <title>Create Next Apps</title>
//       </Head>
//       <>
//         <Header/>
//           <div className='main-container'>
//             <Component {...pageProps} />
//           </div>
//         <Footer/>
//       </> */}
//       <ToastContainer/>
//     </AuthProvider>
//   )
// }


export default MyApp
