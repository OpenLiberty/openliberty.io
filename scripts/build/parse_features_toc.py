from bs4 import BeautifulSoup
from pkg_resources import parse_version
import os, fnmatch
import re
import time

def getTOCVersion(tocString):
    versionPattern = re.compile('^([\s\D]*)(?P<version>\d+[.]?\d*)([\s\D]*)')
    versionMatches = versionPattern.match(tocString)
    if versionMatches is not None:
        version = versionMatches.group('version')
        return version
    else:
        return None

def createTitle(parent, tocHref, tocString):
    TitleDiv = parent.new_tag('div', id="feature_name_string")
    TitleDiv['full_title'] = "{}".format(tocString)
    TitleDiv['aria-label'] = "{}".format(tocString)
    TitleDiv['tabindex'] = '0'
    TitleDiv.string = tocString
    return TitleDiv

def createVersionHref(parent, tocHref, tocString):
    hrefTag = parent.new_tag('div', href=tocHref)
    hrefTag['role'] = 'button'
    hrefTag['class'] = 'feature_version'
    hrefTag['tabindex'] = '0'
    docVersion = getTOCVersion(tocString)
    if docVersion is None:        
        docVersion = getTOCVersion(tocHref)
    hrefTag['aria-label'] = 'Version ' + docVersion
    hrefTag.string = docVersion
    return hrefTag

timerStart = time.time()

# Get all of the Antora versions
featurePath = 'target/jekyll-webapp/docs/'

versions = []
for version in os.listdir(featurePath):
    if(os.path.isdir(featurePath + version + "/reference/")):
        for file in os.listdir(featurePath + version + "/reference/"):
            if file == "feature":
                if version != "modules":
                    versions.append(version)

print("Doc versions:")
print(versions)

# Only process the features of the highest version for the docs draft site
if(os.getenv("DRAFT_SITE") or os.getenv("DOCS_DRAFT_SITE")):
    max = ['0', '0', '0', '0']
    for version in versions:
        nums = version.split('.')
        if(int(nums[0]) > int(max[0])):
            max = nums
        elif(int(nums[0]) == int(max[0]) and int(nums[3]) > int(max[3])):
            max = nums
    max = '.'.join(max)

    print("Processing only version: " + max + " for the docs draft site.")
    versions = [max]



#Loop through each Antora version to fix its feature TOC and combine the pages
for version in versions:
    # Read in front version/feature but write to all of the antora version later for changing the toc
    antora_path = featurePath + version + "/reference/"
    featureIndex = BeautifulSoup(open(antora_path + 'feature/feature-overview.html'), "lxml")        

    # Keep track of new href with updated versions to update the TOCs later
    commonTOCs = {};

    # gather TOCs with version in the title
    # Find TOC then find the feature section
    toc = featureIndex.find('nav', {'class': 'nav-menu'})
    if toc.find('span', text='Features') is not None:
        featureDropdown = toc.find('span', text='Features').parent
        for featureTOC in featureDropdown.find_all('a', {'class': 'nav-link'}, href=True):
            toc = featureTOC.get('href')
            pattern = re.compile('^(?P<preString>[\s\D]*)-(?P<version>\d+[.]?\d*)(?P<postString>[\s\D]*)')
            matches = pattern.match(toc)
            if matches is None:
                # take care of title with J2EE ...
                pattern = re.compile('^(?P<preString>J2EE[\s\D]+)-(?P<version>\d+[.]?\d*)(?P<postString>[\s\D]*)')
                matches = pattern.match(toc)
            if matches is not None and matches.group('version') is not None:
                tocCompileString = '^' + matches.group('preString') + '-\d+[.]?\d*' + matches.group('postString') + "$"
                tocCommonString = matches.group('preString') + matches.group('postString')
                if tocCommonString not in commonTOCs:
                    commonTOCs[tocCommonString] = tocCompileString
            
        # process each TOC with version in the title
        commonTOCKeys = commonTOCs.keys()
        commonTOCKeys = list(commonTOCKeys)

        TOCToDecompose = []
        for commonTOC in commonTOCKeys:
            commonTOCMatchString = commonTOCs[commonTOC]
            matchingTitleTOCs = featureIndex.find_all('a', {'class': 'nav-link'}, href=re.compile(commonTOCMatchString))
            firstElement = True;
            # determine whether there are multiple versions            
            firstHref = matchingTitleTOCs[0].get('href')
            featurePage  = BeautifulSoup(open(antora_path + '/feature/' + firstHref), "lxml")
            pageTitle = featurePage.find('h1', {'class': 'page'})
            titleDiv = featurePage.new_tag('div', id='feature_name')
            versionDiv = featurePage.new_tag('div', id='feature_versions')
            pageTitle.string = ''
            newTOCHref = ''
            # in reverse descending order
            matchingTOCs = matchingTitleTOCs[::-1]
            for matchingTOC in matchingTOCs:
                tocHref = matchingTOC.get('href')
                if not str.startswith(tocHref, ".."):
                    if firstElement:
                        firstElement = False
                        hrefSplits = tocHref.split('/')
                        lastHrefSplit = hrefSplits[-1]
                        htmlSplits = lastHrefSplit.split('-')
                        lastMatch = re.search(r'\d*.html$', htmlSplits[-1])
                        if lastMatch:
                            del htmlSplits[-1]
                            combineHtml = "-".join(htmlSplits) + '.html'
                            del hrefSplits[-1]
                            newTOCHref = '/'.join(hrefSplits) + '/' + combineHtml
                            title = createTitle(featurePage, tocHref, matchingTOC.string)
                            titleDiv.append(title)
                            hrefTag = createVersionHref(featurePage, tocHref, matchingTOC.string)
                            versionDiv.append(hrefTag)
                    else:
                        hrefTag = createVersionHref(featurePage, tocHref, matchingTOC.string)
                        versionDiv.append(hrefTag)
                        TOCToDecompose.append(matchingTOC.parent)
            # Write the feature title and the versions to the page div
            pageTitle.append(titleDiv)
            pageTitle.append(versionDiv)

            # write to the common version doc with the highest versioned content
            if newTOCHref is not "":
                with open(antora_path + 'feature' +  newTOCHref, "w") as file:
                    file.write(str(featurePage))
            
            # Go through the matching TOC pages and write the version switcher to the top of the page
            for matchingTOC in matchingTOCs:
                # Open page and rewrite the version part
                versionHref = antora_path + 'feature/' + matchingTOC.get('href')
                versionPage = BeautifulSoup(open(versionHref), "lxml")
                versionTitle = versionPage.find('h1', {'class': 'page'})
                versionTitle.replace_with(pageTitle)
                with open(versionHref, "w") as file:
                    file.write(str(versionPage))

        for TOC in TOCToDecompose:
            TOC.decompose()
        
        # Remove .is-current-page so they don't show up as highlighted in other types of docs
        tocs = featureIndex.find_all('li', {'class':'is-current-page'})
        for toc in tocs:
            toc['class'] = 'nav-item'

        # Write the new TOC to the feature-overview.html with version control in it
        with open(antora_path + 'feature/feature-overview.html', "w") as file:     
            file.write(str(featureIndex))

        # Record the toc in the featureIndex to write over the other pages
        featureIndex = BeautifulSoup(open(antora_path + 'feature/feature-overview.html'), "lxml")
        toc = featureIndex.find_all('ul', {'class': 'nav-list'})[0]
        featureTOC = toc.find('span', text='Features').parent

        # Change hrefs to full path so the links work from other doc pages
        for feature in featureTOC.find_all('a', {'class': 'nav-link'}, href=True):
            fullHref = '/docs/' + version + '/reference/feature/' + feature.get('href')
            feature['href'] = fullHref

        # Write the reduced feature TOC of all of the Antora doc pages in this version
        print("Modifying the docs TOCs of version " + version + " to remove the duplicate feature versions.")
        path = featurePath + version
        for root, dirs, files in os.walk(path):
            for basename in files:
                if fnmatch.fnmatch(basename, "*.html"):
                    if(basename != "index.html"):
                        href = os.path.join(root, basename)
                        page = BeautifulSoup(open(href), "lxml")

                        # Find the toc and replace it with the modified toc
                        page_toc = page.find_all('ul', {'class': 'nav-list'})[0]
                        toc_to_replace = page_toc.find('span', text='Features').parent
                        toc_to_replace.clear()
                        toc_to_replace.append(featureTOC)
                        with open(href, "w") as file:           
                            file.write(str(page))

timerEnd = time.time()
print('Total execution time for parsing ToC Features: ', timerEnd - timerStart)