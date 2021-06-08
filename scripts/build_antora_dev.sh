# Serve the antora docs locally for testing

./scripts/build/node_install.sh

# Install http-server for local site viewing
npm i -g http-server

./scripts/build/antora_install.sh

# add noindex metdata for non prod sites
cp src/main/content/_includes/noindex.html src/main/content/antora_ui/src/partials/noindex.hbs

# Run with the --update flag to fetch the latest doc changes
if [[ $* == *--update* ]]; then
    ./scripts/build/antora_clone_playbook.sh
    antora --stacktrace --fetch src/main/content/docs/antora-playbook.yml
else
    antora --stacktrace src/main/content/docs/antora-playbook.yml
fi
http-server src/main/content/docs/build/site
