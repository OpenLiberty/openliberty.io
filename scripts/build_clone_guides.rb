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
require 'octokit'

# This variable is to determine if we want to clone the "still in progress"
# guides that are not ready to be on openliberty.io
cloneDraftGuides = ARGV[0]

# --------------------------------------------
# Get all the Open Liberty repositories
# --------------------------------------------
client = Octokit::Client.new :access_token => ENV['PAT']
client.auto_paginate = true
repos = client.org_repos('OpenLiberty')

# --------------------------------------------
# Travis CI related steps
# --------------------------------------------
# For the interactive guides, only build the dev branch for the TravisCI environments
iguide_branch = 'master'
guide_branch = 'master'
if ENV['TRAVIS']
    if ENV['TRAVIS_BRANCH'] == "multiPane"
        iguide_branch = 'dev'
        guide_branch = 'multipane'
        guide_camelcase_branch = 'multiPane'
    elsif ENV['TRAVIS_BRANCH'] == "development"
        iguide_branch = 'dev'
    end
end

puts "Looking for draft interactive guides with branch: #{iguide_branch}..."

# Function to check if the guide directory exists after a git clone command
def directory_exists?(repo_name)
    File.directory?('src/main/content/guides/' + repo_name)
end

# --------------------------------------------
# Filter for Open Liberty guide repositories
# --------------------------------------------
guides = []
repos.each do |element|
    repo_name = element['name']
    if cloneDraftGuides == "draft-guide"
        ##################
        # DRAFT GUIDES  
        # Clone guides that are still being drafted and are only for the staging website
        if repo_name.start_with?('draft-iguide')
            # Clone the draft interactive guides, using the dev branch for travis and master for all other environments.
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{iguide_branch} --single-branch src/main/content/guides/#{repo_name}`
        elsif repo_name.start_with?('draft-guide')
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{guide_branch} --single-branch src/main/content/guides/#{repo_name}`

            # Clone the draft guide using multiPane because git clone is case sensitive
            if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{guide_camelcase_branch} --single-branch src/main/content/guides/#{repo_name}`
            end

            # Clone the default branch if the guide_branch or guide_camelcase_branch does not exist for this guide repo.
            if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
            end
        end
    else
        ##################
        # PUBLISHED GUIDES
        # Clone interactive guides that are ready to be published to openliberty.io
        if repo_name.start_with?('iguide')
            # Clone the interactive guides, using the dev branch for travis and master for all other environments.
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{iguide_branch} --single-branch src/main/content/guides/#{repo_name}`
        elsif repo_name.start_with?('guide')
            # Clone static guides that are ready to be published to openliberty.io
            `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{guide_branch} --single-branch src/main/content/guides/#{repo_name}`

             # Clone the draft guide using multiPane because git clone is case sensitive
             if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git --branch #{guide_camelcase_branch} --single-branch src/main/content/guides/#{repo_name}`
             end

            # Clone the default branch if the guide_branch or guide_camelcase_branch does not exist for this guide repo.
            if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
            end            
        end
    end
end