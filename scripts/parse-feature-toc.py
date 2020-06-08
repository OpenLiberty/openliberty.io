from bs4 import BeautifulSoup
from pkg_resources import parse_version
import os, fnmatch
import re

def getTOCVersion(tocString):
    versionPattern = re.compile('^([\s\D]*)(?P<version>\d+[.]?\d*)([\s\D]*)')
    versionMatches = versionPattern.match(tocString)
    if versionMatches is not None:
       version = versionMatches.group('version')
       if version == "7" and tocString.startswith("Java EE 7"):
           version = "EE 7"
       return version
    else:
       return None

def createVersionHref(parent, tocHref, tocString, firstElement):
    hrefTag = parent.new_tag('div', href=tocHref)
    hrefTag['role'] = 'button'
    hrefTag['class'] = 'feature_version'
    hrefTag['full_title'] = "{}".format(tocString)
    hrefTag['aria-label'] = "{}".format(tocString)
    hrefTag['tabindex'] = '0'
    docVersion = getTOCVersion(tocString)
    if docVersion is not None:
        hrefTag.string = docVersion
    else:
        if firstElement:
            hrefTag.string = tocString + " " + getTOCVersion(tocHref)
        else:
            hrefTag.string = getTOCVersion(tocHref)
    return hrefTag

# Get all of the Antora versions
featurePath = 'target/jekyll-webapp/docs/'

versions = []
for version in os.listdir(featurePath):
    if(os.path.isdir(featurePath + version + "/reference/")):
        for file in os.listdir(featurePath + version + "/reference/"):
            if file == "feature":
                # Look for featurePath + version + ref + feature
                if version != "modules":
                    versions.append(version)

# Loop through each Antora version to fix its feature TOC and combine the pages
for version in versions:
    # Read in front version/feature but write to all of the antora version later for changing the toc
    antora_path = featurePath + version + "/reference/"

    featureIndex = BeautifulSoup(open(antora_path + 'feature/featureOverview.html'), "html.parser")

    # Keep track of new href with updated versions to update the TOCs later
    commonTOCs = {};
    # gather TOCs with version in the title
    # Find TOC then find the feature section
    toc = featureIndex.find('nav', {'class': 'nav-menu'})
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

    for commonTOC in commonTOCKeys:
        commonTOCMatchString = commonTOCs[commonTOC]
        matchingTitleTOCs = featureIndex.find_all('a', {'class': 'nav-link'}, href=re.compile(commonTOCMatchString))
        firstElement = True;
        # determine whether there are multiple versions
        if len(matchingTitleTOCs) > 1:
            # multiple versions of the same title found, create a new html from the template
            # to put the versions at the top of the page
            firstHref = matchingTitleTOCs[0].get('href')
            featurePage  = BeautifulSoup(open(antora_path + '/feature/' + firstHref), "html.parser")
            versionHrefs = featurePage.find('h1', {'class': 'page'})
            versionHrefs.string = ''
            newTOCHref = ''
            # in reverse descending order
            matchingTOCs = matchingTitleTOCs[::-1]
            TOCToDecompose = []
            for matchingTOC in matchingTOCs:
                tocHref = matchingTOC.get('href')
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
                        hrefTag = createVersionHref(featurePage, tocHref, matchingTOC.string, True)
                        versionHrefs.append(hrefTag)
                else:
                    hrefTag = createVersionHref(featurePage, tocHref, matchingTOC.string, False)
                    versionHrefs.append(hrefTag)
                    TOCToDecompose.append(matchingTOC.parent)
            
            # Go through the matching TOC pages and write the version switcher to the top of the page
            for matchingTOC in matchingTOCs:
                # Open page and rewrite the version part
                versionHref = antora_path + 'feature/' + matchingTOC.get('href')
                versionPage = BeautifulSoup(open(versionHref), "html.parser")
                versionTitle = versionPage.find('h1', {'class': 'page'})
                versionTitle.replace_with(versionHrefs)
                with open (versionHref, "w") as file:
                    file.write(str(versionPage))

            for TOC in TOCToDecompose:
                TOC.decompose()            

    # rename the original featureOverview.html and write the new TOC to the featureOverview .html with version control in it
    os.rename(antora_path + 'feature/featureOverview.html', antora_path + 'feature/featureOverview.html.orig')
    with open(antora_path + 'feature/featureOverview.html', "w") as file:            
        file.write(str(featureIndex))

    # Record the toc in the featureIndex to write over the other pages
    featureIndex = BeautifulSoup(open(antora_path + 'feature/featureOverview.html'), "html.parser")
    combinedTOC = featureIndex.find_all('ul', {'class': 'nav-list'})[0]

# Write the reduced feature TOC of all of the Antora doc pages
for version in versions:
    print("Modifying the docs TOCs of version " + version + " to remove the duplicate feature versions.")
    path = featurePath + version 
    for root, dirs, files in os.walk(path):
        for basename in files:
            if fnmatch.fnmatch(basename, "*.html"):
                if(basename != "index.html"):
                    href = os.path.join(root, basename)
                    page = BeautifulSoup(open(href), "html.parser")

                    # Find the toc and replace it with the modified toc
                    nav_lists = page.find_all('ul', {'class': 'nav-list'})
                    if(nav_lists):
                        toc = nav_lists[0]
                        # toc.clear()
                        toc.replace_with(combinedTOC)
                        with open(href, "w") as file:            
                                file.write(str(page))