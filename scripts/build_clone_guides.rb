# This script is to automate the publication of guides to 
# openliberty.io and the staging site (openlibertydev.mybluemix.net)
#
# The assumption is that guides that are ready for openliberty.io 
# have a GitHub repository name starting with:
#       guide* or iguide*
#
# The assumption is that a guide that are still being development, 
# but need to be on the test website have a GitHub repository name starting with:
#       draft-guide*
require 'json'

# This variable is to determine if we want to clone the "still in progress"
# guides that are not ready to be on openliberty.io
cloneDraftGuides = ARGV[0]

# Get all the Open Liberty repositories
response = `curl https://api.github.com/orgs/OpenLiberty/repos?access_token=$PAT`
json = JSON.parse(response)

# Filter for Open Liberty guide repositories
guides = []
json.each do |element|
    repo_name = element['name']
    if cloneDraftGuides == "draft-guide"
        ##################
        # DRAFT GUIDES
        # Clone guides that are still being drafted and are only for the staging website
        if repo_name.start_with?('draft-iguide')
            # Always clone the master branch for interactive guides
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch master --single-branch src/main/content/guides/#{repo_name}`
        elsif repo_name.start_with?('draft-guide')
            `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
        end
    else
        ##################
        # PUBLISHED GUIDES
        # Clone interactive guides that are ready to be published to openliberty.io
        if repo_name.start_with?('iguide')
            # Always clone the master branch for interactive guides
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch master --single-branch src/main/content/guides/#{repo_name}`
        elsif repo_name.start_with?('guide')
            # Clone static guides that are ready to be published to openliberty.io
            `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
        end
    end
end