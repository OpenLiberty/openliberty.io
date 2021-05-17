# Serve the antora docs locally for testing

./scripts/build/antora_install.sh

# Run with the --update flag to fetch the latest doc changes
if [[ $* == *--update* ]]; then
    ./scripts/build/antora_clone_playbook.sh
    antora --stacktrace --fetch src/main/content/docs/antora-playbook.yml
else
    antora --stacktrace src/main/content/docs/antora-playbook.yml
fi
serve src/main/content/docs/build/site
