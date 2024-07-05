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
puts "Using Ruby to get all guide repos"

puts "git version:"
`git --version`

# --------------------------------------------
# Get all the Open Liberty repositories
# --------------------------------------------
client = Octokit::Client.new :access_token => ENV['PAT']
client.auto_paginate = true
repos = client.org_repos('OpenLiberty')

# --------------------------------------------
# For non-production sites, select the correct branch of the guide
# --------------------------------------------
# For the interactive guides, only build the dev branch for non-prod sites
guide_branch = 'prod'
fallback_guide_branch = 'prod'
if ENV['GUIDE_CLONE_BRANCH']
    guide_branch = ENV['GUIDE_CLONE_BRANCH']
elsif ENV['STAGING_SITE'] || ENV['GUIDES_STAGING_SITE']
    guide_branch = 'staging'
    fallback_guide_branch = 'qa'
elsif ENV['DRAFT_SITE'] || ENV['GUIDES_DRAFT_SITE']
    guide_branch = 'draft'
    fallback_guide_branch = 'dev'
elsif ENV['NOT_PROD_SITE'] == 'true'
    puts "Skipping cloning any guides"
    exit
end

puts "Looking for guides with branch: #{guide_branch}..."

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
    ##################
    # PUBLISHED GUIDES
    # Clone static & interactive guides that are ready to be published to openliberty.io
    if repo_name.start_with?('iguide') || repo_name.start_with?('guide')
        # Clone the guides, using the dev branch for travis and prod for all other environments.
        # `git clone https://github.com/OpenLiberty/#{repo_name}.git -b #{guide_branch} src/main/content/guides/#{repo_name}`
        system("git","clone","https://github.com/OpenLiberty/#{repo_name}.git","-b","#{guide_branch}","src/main/content/guides/#{repo_name}")
        # # Clone the fallback branch if the guide_branch does not exist for this guide repo.
        if !(directory_exists?(repo_name))
            # `git clone https://github.com/OpenLiberty/#{repo_name}.git -b #{fallback_guide_branch} src/main/content/guides/#{repo_name}`
            system("git","clone","https://github.com/OpenLiberty/#{repo_name}.git","-b","#{fallback_guide_branch}","src/main/content/guides/#{repo_name}")
        end

        # Clone the default branch if the fallback_guide_branch does not exist for this guide repo.
        if !(directory_exists?(repo_name))
            # `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
            system("git","clone","https://github.com/OpenLiberty/#{repo_name}.git","src/main/content/guides/#{repo_name}")
        end
    end
    if ENV['DRAFT_SITE'] || ENV['GUIDES_DRAFT_SITE']
        ##################
        # DRAFT GUIDES  
        # Clone guides that are still being drafted (draft sites)
        if repo_name.start_with?('draft-iguide') || repo_name.start_with?('draft-guide')
            # Clone the draft guides, using the dev branch for travis and draft for all other environments.
            `git clone https://github.com/OpenLiberty/#{repo_name}.git -b #{guide_branch} src/main/content/guides/#{repo_name}`

            # Clone the fallback branch if the guide_branch does not exist for this guide repo.
            if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git -b #{fallback_guide_branch} src/main/content/guides/#{repo_name}`
            end

            # Clone the default branch if the fallback_guide_branch does not exist for this guide repo.
            if !(directory_exists?(repo_name))
                `git clone https://github.com/OpenLiberty/#{repo_name}.git src/main/content/guides/#{repo_name}`
            end
        end
    end
end