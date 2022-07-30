let unirest = require("unirest");
const express = require("express");
const axios = require("axios").default;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const stkpushurl =
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

app.get("/accesstoken", authsafnode, (req, res) => {
  try {
    //*     get access token using consumer key and consumer secret
    // authsafcom(res)
    console.log("req body:", req.body.access_token);
    res.send({ acctoken: req.body.access_token });
  } catch (error) {
    res.send(error.message);
  }
});

// day()

// makejson()

app.get("/stkpush", authsafnode, async (req, res) => {
  console.log("token received in stkpush: ", req.body.access_token);
  try {
    const auth = "Bearer " + req.body.access_token;
    // console.log(auth);
    const timestamp = Timestamp();

    // *  to generate pass word we join the SHORTCODE + PASSKEY + TIMESTAMP into base 64 Buffer.from(shortcode+passkey+timestamp).toString('base64')
    const passwordbuffer = Buffer.from(
      "174379" +
        "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
        timestamp
    ).toString("base64");
    // *  console.log('buffer password: ',passwordbuffer);
    // * the pass key and time stamp were attained from decoding the encoded password
    const testpassword = Buffer.from(
      "174379" +
        "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
        "20160216165627"
    ).toString("base64");

    // * safcom test line 254708374149

    const stkresult = await axios.post(
      stkpushurl,
      {
        BusinessShortCode: "174379",
        Password:
          "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",
        Timestamp: "20160216165627",
        TransactionType: "CustomerPayBillOnline",
        Amount: "1",
        PartyA: "254713767648",
        PartyB: "174379",
        PhoneNumber: "254713767648",
        CallBackURL: "https://fa21-197-156-191-6.in.ngrok.io/callback",
        AccountReference: "Test",
        TransactionDesc: "Test",
      },
      { headers: { Authorization: auth } }
    );
    // * console.log('stk result:',stkresult.data);

    res.send({ message: stkresult.data });
  } catch (error) {
    // * console.log('error encounterd stk push: ',error.message);
    res.send({ message: error.message, err: error });
  }
});

app.post("/callback", (req, res) => {
  console.log("....................body after paynment....................");
  console.log(req.body);
  console.log(
    "....................body.body after paynment...................."
  );

  console.log(req.body.Body);
  console.log(
    "....................body.body.stkcallback after paynment...................."
  );
  console.log(req.body.Body.stkCallback.CallbackMetadata);

  res.send({ resp: req.body.Body.stkCallback });
});

app.get("/registerurls", authsafnode, async (req, res) => {
  try {
    const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
    const auth = "Bearer " + req.body.access_token;
    console.log("token: ", auth);

    const response = await axios.post(
      url,
      {
        ShortCode: "600988",
        ResponseType: "Completed",
        ConfirmationURL: "https://fa21-197-156-191-6.in.ngrok.io/confirmation",
        ValidationURL: "https://fa21-197-156-191-6.in.ngrok.io/validation",
      },
      {
        headers: { Authorization: auth },
      }
    );
    console.log("registreation of url initiated: ", response);
  } catch (error) {
    console.log("error: ", error.response);
    res
      .status(500)
      .send({ message: "error while registering URLs", err: error });
  }
});

app.get("/simulatepaybill", authsafnode, async (req, res) => {
  try {
    const auth = "Bearer " + req.body.access_token;
    const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";

    const response = await axios.post(
      url,
      {
        CommandID: "CustomerPayBillOnline",
        Amount: "10",
        Msisdn: "254724628580",
        BillRefNumber: "00000",
        ShortCode: "600247",
      },
      { headers: { Authorization: auth } }
    );

    console.log("simualation response: ", response.data);
    res.send({ result: response.data });
  } catch (error) {
    console.log("error in sumulating paybill online: ", error);
    res.send({ err: error });
  }
});

app.post("/validation", (req, res) => {
  console.log("validation: ", req.body);
  res
    .status(200)
    .send({ message: "validation  url registered", body: req.body });
});

app.post("/confirmation", (req, res) => {
  console.log("confirmation: ", req.body);
  res.status(200).send({ message: "confirmation url registered" });
});

async function authsafnode(req, res, next) {
  // get basic auth by conination of  consumer key:consumer secret to base 64
  try {
    const consumerkey = "pRYr6zjq0i8L1zzwQDMLpZB3yPCkhMsc";
    const consumersecret = "Rf22BfZog0qQGlV9";
    const keytoencode = consumerkey + ":" + consumersecret;
    const auth = Buffer.from(keytoencode).toString("base64");
    // console.log("auth token: ",auth);

    const result = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    // console.log(result.data.access_token);
    req.body.access_token = result.data.access_token;

    next();
  } catch (error) {
    console.log("error caught: ", error.message);
    res.status(500).send({ message: "server error", err: error.message });
  }
}

function Timestamp() {
  const timestamp = new Date();

  const date =
    timestamp.getFullYear() +
    "" +
    mapmonth() +
    mapdate() +
    "" +
    maphour() +
    "" +
    mapminutes() +
    "" +
    mapseconds();

  return date;
}

function maphour() {
  const timestamp = new Date();
  let Returnedhour = "";
  const hour = timestamp.getHours();
  if (hour < 10) {
    Returnedhour = "0" + hour;
    //     console.log('hour:',Returnedhour);
    return Returnedhour;
  } else {
    Returnedhour = "" + hour;
    //    console.log(Returnedhour);
    return Returnedhour;
  }
}
function mapdate() {
  const timestamp = new Date();
  let day = "";
  const date = timestamp.getDate();
  if (date < 10) {
    day = "0" + date;
    //     console.log('date:',date);
    return day;
  } else {
    day = "" + date;
    //      console.log(day);
    return day;
  }
}
function mapmonth() {
  const timestamp = new Date();
  let returnedmonth = "";
  const month = timestamp.getMonth();
  if (month < 10) {
    returnedmonth = "0" + month;
    //  console.log('month:',month);
    return returnedmonth;
  } else {
    returnedmonth = "" + date;
    //  console.log(returnedmonth);
    return returnedmonth;
  }
}

function mapminutes() {
  const timestamp = new Date();
  let returnedminutes = "";
  const minutes = timestamp.getMinutes();
  if (minutes < 10) {
    returnedminutes = "0" + minutes;
    //  console.log('month:',month);
    return returnedminutes;
  } else {
    returnedminutes = "" + minutes;
    //  console.log(returnedminutes);
    return returnedminutes;
  }
}
function mapseconds() {
  const timestamp = new Date();
  let returnedseconds = "";
  const seconds = timestamp.getSeconds();
  if (seconds < 10) {
    returnedseconds = "0" + seconds;
    //  console.log('month:',month);
    return returnedseconds;
  } else {
    returnedseconds = "" + seconds;
    //  console.log(returnedseconds);
    return returnedseconds;
  }
}

//authsafcom()
app.listen(2000, () => {
  console.log("app running");
});
