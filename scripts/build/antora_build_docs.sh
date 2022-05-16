echo "Using the Antora playbook to generate what content to display for docs"

echo "npm analysis antora_build" 
npm ls -g --depth=0

if [ "$PROD_SITE" = true ]
  then    
    # Enable google analytics in docs
    antora --fetch --stacktrace --key google-analytics=GTM-TKP3KJ7 src/main/content/docs/antora-playbook.yml
  else
    antora --fetch --stacktrace src/main/content/docs/antora-playbook.yml
fi
