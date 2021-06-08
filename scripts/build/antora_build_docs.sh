echo "Using the Antora playbook to generate what content to display for docs"
if [ "$PROD_SITE" = true ]
  then    
    # Enable google analytics in docs
    # antora --fetch --stacktrace --google-analytics-key=GTM-TKP3KJ7 src/main/content/docs/antora-playbook.yml
    
    # use local copy of antora. Once antora is upgraded to 3.0 the line below should be removed and replaced with the above commented out line above
    antora/node_modules/.bin/antora --fetch --stacktrace --google-analytics-key=GTM-TKP3KJ7 src/main/content/docs/antora-playbook.yml
  else
    # antora --fetch --stacktrace src/main/content/docs/antora-playbook.yml
    
    # use local copy of antora. Once antora is upgraded to 3.0 the line below should be removed and replaced with the above commented out line above
    antora/node_modules/.bin/antora --fetch --stacktrace src/main/content/docs/antora-playbook.yml
fi
