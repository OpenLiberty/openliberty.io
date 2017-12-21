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

# Exceptions due to adopting of this new automated integration of guides
# There are two guides that are currently still in draft mode but do not have "draft-" in their repository name.
# To avoid unneeded trouble of renaming them, lets just mark the guides as draft with special code.
# The end goal is this array to _always_ be empty.
draftRepos = ["guide-microprofile-config"]

# Filter for Open Liberty guide repositories
guides = []
json.each do |element|
    repo_name = element['name']
    if cloneDraftGuides == "draft-guide"
        if repo_name.start_with?('draft-guide') or repo_name.start_with?('draft-iguide') or draftRepos.include?(repo_name)
            # Clone guides that are still being drafted and are only for the staging website
            `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
        end
    else
        if (repo_name.start_with?('guide') or repo_name.start_with?('iguide')) and not draftRepos.include?(repo_name)
            # Clone guides that are ready to be published to openliberty.io
            `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
        end
    end
end