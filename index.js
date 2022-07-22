let unirest = require('unirest');
const express = require('express')
const axios = require('axios').default;
const app= express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));


const stkpushurl='https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

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

// day()

// makejson()

app.get('/stkpush',authsafnode,async(req,res)=>{
    try {
   
        const auth = 'Bearer '+req.body.access_token
         const timestamp = Timestamp()

        //  to generate pass word we join the SHORTCODE + PASSKEY + TIMESTAMP into base 64 Buffer.from(shortcode+passkey+timestamp).toString('base64')
         const passwordbuffer= Buffer.from('174379'+'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'+timestamp).toString('base64')
        //  console.log('buffer password: ',passwordbuffer);
         // the pass key and time stamp were attained from decoding the encoded password
         const testpassword= Buffer.from('174379'+'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'+'20160216165627').toString('base64')
        
        //  console.log('password: ',testpassword);
        const data={
            BusinessShortCode:"174379",    
            Password: "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",    
          Timestamp:"20160216165627",    
          TransactionType: "CustomerPayBillOnline",    
            Amount:"1",    
           PartyA:"254720849101",    
            PartyB:"174379",    
          PhoneNumber:"254720849101",    
          CallBackURL:"http://197.248.90.146:2000/callback",    
          AccountReference:"Test",    
          TransactionDesc:"Test sim tool kit"
        }

        const payload = JSON.stringify(data)

       // safcom test line 254708374149

        const stkresult = await axios.post(stkpushurl,
            { 
                    
                "BusinessShortCode": "174379",
                "Password": `${passwordbuffer}`,
                "Timestamp": `${timestamp}`,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": "254742226392",
                "PartyB": "174379",
                "PhoneNumber": "254742226392",
                "CallBackURL": "https://mydomain.com/pat",
                "AccountReference": "Test",
                "TransactionDesc": "Test"
                 

         },{headers:{'Authorization':auth}})
      //  console.log('stk result:',stkresult.data);

        res.send({message:stkresult.data})
        
    } catch (error) {

      //  console.log('error encounterd stk push: ',error.message);
        res.send({message:error.message,err:error})
        
    }

})


app.post('/callback',(req,res)=>{
    console.log(req.body);
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




async function authsafnode(req,res,next){

    // get basic auth by conination of  consumer key:consumer secret to base 64
    try {
        const consumerkey='pRYr6zjq0i8L1zzwQDMLpZB3yPCkhMsc'
        const consumersecret='Rf22BfZog0qQGlV9'
        const keytoencode=consumerkey+':'+consumersecret
        const auth = Buffer.from(keytoencode).toString('base64')
        // console.log("auth token: ",auth);

        const result = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            headers:{'Authorization':`Basic ${auth}`}
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


function Timestamp(){
    const timestamp=new Date()

    const date=timestamp.getFullYear()+""+mapmonth()+mapdate()+""+maphour()+""+mapminutes()+""+mapseconds()

    return date 
}


function maphour(){
    const timestamp=new Date()
    let Returnedhour=''
    const hour = timestamp.getHours()
    if(hour<10){
        Returnedhour='0'+hour
   //     console.log('hour:',Returnedhour);
        return Returnedhour

    }else{

        Returnedhour=''+hour
    //    console.log(Returnedhour);
        return Returnedhour

    }

}
function mapdate(){
    const timestamp=new Date()
    let day=''
    const date = timestamp.getDate()
    if(date<10){
        day='0'+date
   //     console.log('date:',date);
        return day

    }else{

        day=''+date
  //      console.log(day);
        return day
    }

}
function mapmonth(){
    const timestamp=new Date()
    let returnedmonth=''
    const month = timestamp.getMonth()
    if(month<10){
        returnedmonth='0'+month
      //  console.log('month:',month);
        return returnedmonth

    }else{

        returnedmonth=''+date
      //  console.log(returnedmonth);
        return returnedmonth
    }

}

function mapminutes(){
    const timestamp=new Date()
    let returnedminutes=''
    const minutes = timestamp.getMinutes()
    if(minutes<10){
        returnedminutes='0'+minutes
      //  console.log('month:',month);
        return returnedminutes

    }else{

        returnedminutes=''+minutes
      //  console.log(returnedminutes);
        return returnedminutes
    }

}function mapseconds(){
    const timestamp=new Date()
    let returnedseconds=''
    const seconds = timestamp.getSeconds()
    if(seconds<10){
        returnedseconds='0'+seconds
      //  console.log('month:',month);
        return returnedseconds

    }else{

        returnedseconds=''+seconds
      //  console.log(returnedseconds);
        return returnedseconds
    }

}      




//authsafcom()
app.listen(2000,()=>{
    console.log('app running');
})