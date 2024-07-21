

function returnStatus(res,code,error,message,additionalData){

    return res.status(code).json({
        error:error,
        message:message,
        status:code,
        ...additionalData,
    });
}

module.exports=returnStatus;