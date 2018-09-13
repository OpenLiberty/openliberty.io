#!/bin/bash

# Check if KEY_JKS has the public.dhe.ibm.com certificate
function has_dhe_cert {
  if [[ -z $SERVER_DIR ]]; then echo "Set SERVER_DIR"; exit 1; fi
  if [[ -z $KEY_JKS ]]; then echo "Set KEY_JKS"; exit 1; fi

  echo "Checking to see if keystore has public.dhe.ibm.com certificate"
  HAS_CERT=`. $SERVER_DIR/server.env; keytool -list -keystore $KEY_JKS -storepass $keystore_password 2>/dev/null| grep public.dhe.ibm.com 2>/dev/null`
}

# Populate the KEY_JKS with public.dhe.ibm.com certificate
function get_dhe_signer {
  if [[ -z $SERVER_DIR ]]; then echo "Set SERVER_DIR"; exit 1; fi
  if [[ -z $KEY_JKS ]]; then echo "Set KEY_JKS"; exit 1; fi

  echo "Configuring keystore to trust public.dhe.ibm.com"

  # Grab the SSL certificate from public.dhe.ibm.com
  echo | openssl s_client -showcerts -servername public.dhe.ibm.com -connect public.dhe.ibm.com:443 2>/dev/null | openssl x509 -inform pem -outform pem -out $SERVER_DIR/dhe-cert.pem

  # Convert it to an importable form
  openssl x509 -outform der -in $SERVER_DIR/dhe-cert.pem -out $SERVER_DIR/dhe-cert.der

  # Import it to the server's key.jks
  . $SERVER_DIR/server.env ; keytool -import -alias public.dhe.ibm.com -keystore $KEY_JKS -file $SERVER_DIR/dhe-cert.der -storepass $keystore_password  -noprompt 2>/dev/null
  if [[ $? -eq 0 ]]; then
    echo "SUCCESS: Keystore configured to trust public.dhe.ibm.com";
  else
    echo "FAILURE: Unable to configure keystore";
  fi
}

# Main method, for testing and direct use
function main {
  has_dhe_cert
  if [[ $HAS_CERT ]]; then
    echo "Keystore appears to be configured correctly";
  else
    get_dhe_signer
  fi
}

# If called directly, drive the script
# For example:
# SERVER_DIR=target/liberty/wlp/usr/servers/BoostServer KEY_JKS=target/liberty/wlp/usr/servers/BoostServer/resources/security/key.jks ./scripts/get_dhe_signer.sh
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

