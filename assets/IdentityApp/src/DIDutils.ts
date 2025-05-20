// DIDutils.ts (ridotto alle funzioni usate in identity.ts)

import {
  IotaDocument,
  MethodScope,
  MethodData,
  MethodDigest,
  MethodType,
  VerificationMethod,
  Storage,
  Jwk,
  JwkMemStore,
  JwkType,
  KeyIdMemStore,
  IdentityClient,
  IdentityClientReadOnly,
  JwsAlgorithm,
  StorageSigner,
} from "@iota/identity-wasm/web";

import { decodeIotaPrivateKey } from "@iota/iota-sdk/cryptography";
import { IotaClient } from "@iota/iota-sdk/client";
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";

export function getMemstorage(): Storage {
  return new Storage(new JwkMemStore(), new KeyIdMemStore());
}

export async function createDocumentForNetworkUsingKeyPair(
  storage: Storage,
  network: string,
  keyPair: Ed25519Keypair
): Promise<[IotaDocument, string]> {
  const unpublished = new IotaDocument(network);
  const alg = JwsAlgorithm.EdDSA;
  const jwk = getCompleteJwkFromKeyPair(keyPair, alg);
  const keyId = await storage.keyStorage().insert(jwk);
  const publicJwk = jwk.toPublic();
  if (!publicJwk) {
    throw new Error("Failed to derive public JWK from key pair.");
  }
  const methodData = MethodData.newJwk(publicJwk);
  const methodId = unpublished.id().join(`#${keyId}`);
  const method = new VerificationMethod(
    methodId,
    unpublished.id().toCoreDid(),
    MethodType.JsonWebKey2020(),
    methodData
  );
  const methodDig = new MethodDigest(method);
  await storage.keyIdStorage().insertKeyId(methodDig, keyId);
  unpublished.insertMethod(method, MethodScope.VerificationMethod());
  return [unpublished, keyId];
}

export async function getIdentityFromKeyPair(
  client: IotaClient,
  storage: Storage,
  keypair: Ed25519Keypair,
  alg: JwsAlgorithm
): Promise<IdentityClient> {
  const identityClientReadOnly = await IdentityClientReadOnly.create(client);
  const jwk = getCompleteJwkFromKeyPair(keypair, alg);
  const publicKeyJwk = jwk.toPublic();
  if (!publicKeyJwk) {
    throw new Error("Failed to derive public JWK from key pair.");
  }
  const keyId = await storage.keyStorage().insert(jwk);
  const signer = new StorageSigner(storage, keyId, publicKeyJwk);
  return await IdentityClient.create(identityClientReadOnly, signer);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function getCompleteJwkFromKeyPair(keyPair: Ed25519Keypair, alg: JwsAlgorithm): Jwk {
  const publicKeyBytes = keyPair.getPublicKey().toRawBytes();
  const x = base64UrlEncode(publicKeyBytes);
  const privateKeyDecoded = decodeIotaPrivateKey(keyPair.getSecretKey()).secretKey;
  const d = privateKeyDecoded ? base64UrlEncode(privateKeyDecoded) : undefined;
  return new Jwk({
    kty: JwkType.Okp,
    crv: "Ed25519",
    x,
    d,
    alg,
  });
}
