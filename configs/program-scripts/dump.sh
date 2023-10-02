#!/bin/bash

# output colours
RED() { echo $'\e[1;31m'$1$'\e[0m'; }
GRN() { echo $'\e[1;32m'$1$'\e[0m'; }

CURRENT_DIR=$(pwd)
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
# go to parent folder
cd $(dirname $(dirname $SCRIPT_DIR))

OUTPUT=$1
# Below are external programs that should be included in the local validator.
# The program IDs and binary names should be listed in the same order.
EXTERNAL_ID=()
EXTERNAL_SO=()

if [ -z ${RPC+x} ]; then
    RPC="https://api.mainnet-beta.solana.com"
fi

if [ -z "$OUTPUT" ]; then
    echo "missing output directory"
    exit 1
fi

# creates the output directory if it doesn't exist
if [ ! -d ${OUTPUT} ]; then
    mkdir ${OUTPUT}
fi

# only prints this if we have external programs
if [ ${#EXTERNAL_ID[@]} -gt 0 ]; then
    echo "Dumping external programs to: '${OUTPUT}'"
fi

# dump external programs binaries if needed
for i in ${!EXTERNAL_ID[@]}; do
    if [ ! -f "${OUTPUT}/${EXTERNAL_SO[$i]}" ]; then
        solana program dump -u $RPC ${EXTERNAL_ID[$i]} ${OUTPUT}/${EXTERNAL_SO[$i]}
    else
        solana program dump -u $RPC ${EXTERNAL_ID[$i]} ${OUTPUT}/onchain-${EXTERNAL_SO[$i]} >/dev/null
        ON_CHAIN=$(sha256sum -b ${OUTPUT}/onchain-${EXTERNAL_SO[$i]} | cut -d ' ' -f 1)
        LOCAL=$(sha256sum -b ${OUTPUT}/${EXTERNAL_SO[$i]} | cut -d ' ' -f 1)

        if [ "$ON_CHAIN" != "$LOCAL" ]; then
            echo $(RED "[ WARNING ] on-chain and local binaries are different for '${EXTERNAL_SO[$i]}'")
        else
            echo "$(GRN "[ SKIPPED ]") on-chain and local binaries are the same for '${EXTERNAL_SO[$i]}'"
        fi

        rm ${OUTPUT}/onchain-${EXTERNAL_SO[$i]}
    fi
done

# only prints this if we have external programs
if [ ${#EXTERNAL_ID[@]} -gt 0 ]; then
    echo ""
fi

cd ${CURRENT_DIR}
