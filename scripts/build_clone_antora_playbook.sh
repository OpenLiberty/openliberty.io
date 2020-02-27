# Clone the Antora playbook used for building the docs pages

echo "Cloning the docs Antora playbook"
# Todo specify what playbook branch to clone based on the environment
git clone https://github.com/OpenLiberty/docs-playbook.git --branch prod

# Move the docs playbook over to the docs dir so it can generate the doc pages
mv -f docs-playbook/antora-playbook.yml src/main/content/docs/

# Remove the docs playbook repository
rm -rf docs-playbook