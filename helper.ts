import * as ethUtil from "ethereumjs-util";
import { hexToBytes, utf8ToHex } from "web3-utils";
import Wallet from "ethereumjs-wallet";

export const signMessage = (privateKey: string, message: string) => {
  const privKeyBuff = Buffer.from(privateKey, "hex");
  if (!ethUtil.isValidPrivate(privKeyBuff)) {
    throw new Error(`signMessage:: ${privateKey} is invalid private key`);
  }
  const msgHash = ethUtil.hashPersonalMessage(
    Buffer.from(hexToBytes(utf8ToHex(message)))
  );
  const ecdsaSignature = ethUtil.ecsign(msgHash, privKeyBuff);
  return ethUtil.toRpcSig(ecdsaSignature.v, ecdsaSignature.r, ecdsaSignature.s);
};

export const extractAddressFromPrivateKey = (privateKey: string) => {
  const privKeyBuff = Buffer.from(privateKey, "hex");
  if (!ethUtil.isValidPrivate(privKeyBuff)) {
    throw new Error(
      `extractAddressFromPrivateKey:: ${privateKey} is invalid private key`
    );
  }
  return Wallet.fromPrivateKey(privKeyBuff).getAddressString();
};