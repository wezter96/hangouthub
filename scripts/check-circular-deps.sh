#!/bin/bash

src=$1
cmd=$(npx --yes madge -c $src 2>&1)
echo "$cmd"

if [[ "$cmd" == *"No circular dependency found"* ]];
then  
  exit 0
else
  exit 1
fi