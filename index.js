let unirest = require('unirest');
const express = require('express')
const axios = require('axios').default;
const app= express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.get('/accesstoken',authsafnode,(req,res)=>{

    try {
        //*     get access token using consumer key and consumer secret
    // authsafcom(res)
    console.log('req body:',req.body.access_token)
    res.send({acctoken:req.body.access_token})

    } catch (error) {
        res.send(error.message)
        
    }

})


app.get('/stkpush',authsafcom,(req,res)=>{

})




app.post('/validation',(req,res)=>{
    console.log('validation: ',req.body);
    res.status(200).send({message:'ok'})

})

app.post('/confirmation',(req,res)=>{

    console.log('confirmation: ',req.body);
    res.status(200).send({message:'ok'})
    
})

app.post('/registerurls',registerurl,(req,res)=>{
    console.log('body: ',req.body);
    res.send({message:'urls registered'})
})


function authsafcom(req,res,next){
    unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
    .headers({ 'Authorization': 'Basic cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ==' })
    .send()
    .end(lres => {
        if (lres.error) throw new Error(lres.error);
     //   console.log(lres.raw_body);

     //  return res.send(lres.raw_body)

       req.body.token=lres.raw_body
       next();
    });
}

async function authsafnode(req,res,next){
    try {

        const result = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            headers:{'Authorization':'Basic cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ=='}
        })

        // console.log(result.data.access_token);
        req.body.access_token=result.data.access_token

        next()

        
    } catch (error) {
        
        console.log('error caught: ',error.message);
        res.status(500).send({message:'server error',
    err:error.message})
    }

}

function registerurl(req,res,next){

     unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl')
.headers({
	'Content-Type': 'application/json',
	'Authorization': 'Bearer 3OAFzy0qsEdjGIzowANdJIPMEAVf'
})
.send(JSON.stringify({
    "ShortCode": 600986,
    "ResponseType": "Completed",
    "ConfirmationURL": "https://102.167.247.189:2000/confirmation",
    "ValidationURL": "https://102.167.247.189:2000/validation",
  }))
.end(Fres => {
	if (Fres.error) throw new Error(Fres.error);
	console.log(Fres.raw_body);

    req.body.urls =Fres.raw_body
    next()
})
}

//authsafcom()
app.listen(2000,()=>{
    console.log('app running');
})