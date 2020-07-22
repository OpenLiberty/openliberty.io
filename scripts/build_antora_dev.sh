# Serve the antora docs locally for testing

./scripts/build_antora_ui.sh

# Run with the --update flag to fetch the latest doc changes
if [[ $* == *--update* ]]; then
    ./scripts/build_clone_antora_playbook.sh
    antora --stacktrace --fetch src/main/content/docs/antora-playbook.yml
else
    antora --stacktrace src/main/content/docs/antora-playbook.yml
fi
serve src/main/content/docs/build/site
