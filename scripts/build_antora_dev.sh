# Serve the antora docs locally for testing
# Have the docs cloned before running this
./scripts/build_antora_ui.sh
antora --stacktrace --fetch src/main/content/docs/antora-playbook.yml
serve src/main/content/docs/build/site
