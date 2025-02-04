// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';
/**
 * @enum {number}
 */
export namespace SelfMessaging{
export enum ACLCommand{
  LIST= 0,
  PERMIT= 1,
  REVOKE= 2
};
}

/**
 * @enum {number}
 */
export namespace SelfMessaging{
export enum ErrType{
  ErrConnection= 0,
  ErrBadRequest= 1,
  ErrInternal= 2,
  ErrMessage= 3,
  ErrAuth= 4,
  ErrACL= 5
};
}

/**
 * @enum {number}
 */
export namespace SelfMessaging{
export enum MsgType{
  MSG= 0,
  ACK= 1,
  ERR= 2,
  AUTH= 3,
  ACL= 4
};
}

/**
 * @enum {number}
 */
export namespace SelfMessaging{
export enum MsgSubType{
  Unknown= 0,
  AuthenticationReq= 1,
  AuthenticationResp= 2,
  AuthenticationQRResp= 3,
  AuthenticationDeepLinkResp= 4,
  FactReq= 5,
  FactResp= 6,
  FactQRResp= 7,
  FactDeepLinkResp= 8,
  EmailSecurityCodeReq= 9,
  EmailSecurityCodeResp= 10,
  PhoneSecurityCodeReq= 11,
  PhoneSecurityCodeResp= 12,
  PhoneVerificationReq= 13,
  PhoneVerificationResp= 14,
  EmailVerificationReq= 15,
  EmailVerificationResp= 16,
  DocumentVerificationReq= 17,
  DocumentVerificationResp= 18
};
}

/**
 * @constructor
 */
export namespace SelfMessaging{
export class Header {
  bb: flatbuffers.ByteBuffer|null = null;

  bb_pos:number = 0;
/**
 * @param number i
 * @param flatbuffers.ByteBuffer bb
 * @returns Header
 */
__init(i:number, bb:flatbuffers.ByteBuffer):Header {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param flatbuffers.ByteBuffer bb
 * @param Header= obj
 * @returns Header
 */
static getRootAsHeader(bb:flatbuffers.ByteBuffer, obj?:Header):Header {
  return (obj || new Header()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param flatbuffers.ByteBuffer bb
 * @param Header= obj
 * @returns Header
 */
static getSizePrefixedRootAsHeader(bb:flatbuffers.ByteBuffer, obj?:Header):Header {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Header()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param flatbuffers.Encoding= optionalEncoding
 * @returns string|Uint8Array|null
 */
id():string|null
id(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
id(optionalEncoding?:any):string|Uint8Array|null {
  var offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
};

/**
 * @returns SelfMessaging.MsgType
 */
msgtype():SelfMessaging.MsgType {
  var offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? /**  */ (this.bb!.readInt8(this.bb_pos + offset)) : SelfMessaging.MsgType.MSG;
};

/**
 * @param flatbuffers.Builder builder
 */
static startHeader(builder:flatbuffers.Builder) {
  builder.startObject(2);
};

/**
 * @param flatbuffers.Builder builder
 * @param flatbuffers.Offset idOffset
 */
static addId(builder:flatbuffers.Builder, idOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, idOffset, 0);
};

/**
 * @param flatbuffers.Builder builder
 * @param SelfMessaging.MsgType msgtype
 */
static addMsgtype(builder:flatbuffers.Builder, msgtype:SelfMessaging.MsgType) {
  builder.addFieldInt8(1, msgtype, SelfMessaging.MsgType.MSG);
};

/**
 * @param flatbuffers.Builder builder
 * @returns flatbuffers.Offset
 */
static endHeader(builder:flatbuffers.Builder):flatbuffers.Offset {
  var offset = builder.endObject();
  return offset;
};

/**
 * @param flatbuffers.Builder builder
 * @param flatbuffers.Offset offset
 */
static finishHeaderBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset);
};

/**
 * @param flatbuffers.Builder builder
 * @param flatbuffers.Offset offset
 */
static finishSizePrefixedHeaderBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset, undefined, true);
};

static createHeader(builder:flatbuffers.Builder, idOffset:flatbuffers.Offset, msgtype:SelfMessaging.MsgType):flatbuffers.Offset {
  Header.startHeader(builder);
  Header.addId(builder, idOffset);
  Header.addMsgtype(builder, msgtype);
  return Header.endHeader(builder);
}
}
}
