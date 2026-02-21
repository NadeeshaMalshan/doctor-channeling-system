const db =require('../config/db');
const crypto = require('crypto');

exports.getPaymentDetails = async(req, res) => {
    const {patientID, doctorID}= req.query;

    try {
        const [rows] =await db.execute(
            'SELECT p.first_name,p.second_name, d.name as doctor_name, d.specialization FROM patients p, doctors d WHERE p.id = ? AND d.id = ?',
            [patientID, doctorID]
        );
        if(rows.length===0){
            return res.status(404).json({message: 'No payment details found'});
        }
        res.status(200).json(rows[0]);
        
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({message: 'Internal server error'});
        
    }
};

//payhere hashing (for security purpose)

exports.generateHash =(req, res)=>{
    //get payhere credentials from .env file
    const {orderID, amount, currency} =req.body;
    const merchantID = process.env.PAYHERE_MERCHENT_ID;
    const merchentSecret =process.env.PAYHERE_SECRET_CODE;

    //create hash UpperCase(MD5(MerchantID + OrderID + Amount + Currency + UpperCase(MD5(MerchantSecret))))
    const hashedSecret = crypto.createHash('md5').update(merchentSecret).digest('hex').toUpperCase();
    const amountFormatted = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2}).replaceAll(',','');

        const hashRaw = merchantID +orderID +amountFormatted +currency +hashedSecret;
        const hash =crypto.createHash('md5').update(hashRaw).digest('hex').toUpperCase();
        res.status(200).json({ hash });
};