const { USHRT_MAX , COMMANDS } = require('./constants')
const { log } = require('./helpers/errorLog')

const createChkSum = (buf)=>{
  let chksum = 0;
  for (let i = 0; i < buf.length; i += 2) {
    if (i == buf.length - 1) {
      chksum += buf[i];
    } else {
      chksum += buf.readUInt16LE(i);
    }
    chksum %= USHRT_MAX;
  }
  chksum = USHRT_MAX - chksum - 1;

  return chksum;
}
module.exports.createTCPHeader = (command , sessionId, replyId, data)=>{
  const dataBuffer = Buffer.from(data);
  const buf = Buffer.alloc(8 + dataBuffer.length);

  buf.writeUInt16LE(command, 0);
  buf.writeUInt16LE(0, 2);

  buf.writeUInt16LE(sessionId, 4);
  buf.writeUInt16LE(replyId, 6);
  dataBuffer.copy(buf, 8);
  
  const chksum2 = createChkSum(buf);
  buf.writeUInt16LE(chksum2, 2);
    
  replyId = (replyId + 1) % USHRT_MAX;
  buf.writeUInt16LE(replyId, 6);
  

  const prefixBuf = Buffer.from([0x50, 0x50, 0x82, 0x7d, 0x13, 0x00, 0x00, 0x00])

  prefixBuf.writeUInt16LE(buf.length, 4)

  return Buffer.concat([prefixBuf, buf]);
}

const removeTcpHeader  = (buf)=>{
if (buf.length < 8) {
    return buf;
  }

  if (buf.compare(Buffer.from([0x50, 0x50, 0x82, 0x7d]), 0, 4, 0, 4) !== 0) {
    return buf;
  }

  return buf.slice(8);
}

module.exports.removeTcpHeader = removeTcpHeader

module.exports.decodeTCPHeader = (header) => {
  const recvData = header.subarray(8)
  const payloadSize = header.readUIntLE(4,2)

  const commandId = recvData.readUIntLE(0,2)
  const checkSum = recvData.readUIntLE(2,2)
  const sessionId = recvData.readUIntLE(4,2)
  const replyId = recvData.readUIntLE(6,2)
  return { commandId , checkSum , sessionId , replyId , payloadSize }

}
