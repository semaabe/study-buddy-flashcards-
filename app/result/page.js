'use client'
import {useEffect, useState} from 'react'
import {useRouter,useSearchParams} from 'next/navigation'
import getstripe from '@/utils/get-stripe'
import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import Image from 'next/image'; // Import Image component from Next.js
import Head from 'next/head'; // Import Head component from Next.js
import { Container, Typography } from '@mui/material'


const inter = Inter({ subsets: ['latin'] });
const ResultPage = () =>{
    const router = useRouter()
    const searchParams = useSearchParams()
    const session_id=searchParams.get('session_id')
    const [loading, setLoading]=useState(true)
    const [session, setSession]= useState(null)
    const [error,setError]=useState(null)

useEffect (()=>{
    const fetchCheckoutSession= async ()=>{
        if (!session_id) return 

        try{ 
            const res = await fetch(`/api/checkout_session?session_id=${session_id}`);

            const sessionData = await res.json()
            if (res.ok){
                setSession(sessionData)
            }else{
                setError(sessionData.error)
            }
        }
        catch (err){
        setError("An Error Occured ")
        }finally{
            setLoading(false)
        }

    }
    fetchCheckoutSession()

} , [session_id])
if (loading){
    return (
        <Container maxWidth= '100vw' sx={{
            textAlign:'center', mt:4
        }}>
        <Typography variant="h6">Loading...</Typography>
        </Container>
    )}
    if (error) {
        return (
          <Container maxWidth="sm" sx={{textAlign: 'center', mt: 4}}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Container>
        )
      }
      return (<Container maxWidth="100vw" sx={{
        textAlign:'center',
        mt:4,
      }}>
        { session.payment_status==="paid"? (<>
        <Typography h='4'> Thank you for purchasing!</Typography>
    <Box sx={{mt:22}}>
        <Typography variant = "h6"> Session ID:{session_id} </Typography>
        <Typography variant='body1'>
            We have recieved your payment. You will receieve an email with the order details shortly.
        </Typography>
    </Box>
    </>
        ) : ( <>
        <Typography variant="h4">Payment Failed</Typography>
        <Box sx= {{mt:22}}>
            <Typography>
            Your Payment was not succesful. Please try again
            </Typography>
        </Box>
        </>
        )}
      </Container>)
}



