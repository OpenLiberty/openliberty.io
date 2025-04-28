#!/bin/bash
echo "Using the Antora playbook to generate what content to display for docs"
echo "npm analysis antora_build" 
npm ls -g --depth=0
antora --fetch --stacktrace src/main/content/docs/antora-playbook.yml
