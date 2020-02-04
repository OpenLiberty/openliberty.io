from bs4 import BeautifulSoup
from pkg_resources import parse_version
import os
import re

def getTOCVersion(tocString):
    versionPattern = re.compile('^([\s\D]*)(?P<version>\d+[.]?\d*)([\s\D]*)')
    versionMatches = versionPattern.match(tocString)
    if versionMatches is not None:
       version = versionMatches.group('version')
       #return versionMatches.group('version')
       if version == "7" and tocString.startswith("Java EE 7"):
           version = "EE 7"
       return version
    else:
       return None

def createHrefNewTag(parent, tocHref, tocString):
    # print('create new href tag')
    # print(parent)
    hrefTag = parent.new_tag('div', href=tocHref)
    hrefTag['role'] = 'button'
    hrefTag['class'] = 'feature_version'
    hrefTag['full_title'] = "{}".format(tocString)
    hrefTag['tabindex'] = '0'
    docVersion = getTOCVersion(tocString)
    if docVersion is not None:
        hrefTag.string = docVersion
    return hrefTag

# rename the original index.html
# os.rename('./target/jekyll-webapp/docs/build/site/feature/latest/featureOverview.html', './target/jekyll-webapp/docs/build/site/feature/latest/featureOverview.html.orig')

featureIndex = BeautifulSoup(open('./target/jekyll-webapp/docs/ref/feature/latest/featureOverview.html'), "html.parser")

commonTOCs = {};
# gather TOCs with version in the title
for featureTOC in featureIndex.find_all('a', {'class': 'nav-link'}, href=True):
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

# Keep track of new href with updated versions to update the TOCs later
combinedPages = [];

# Add to version href if we need it for linking
antora_path = "./target/jekyll-webapp/docs/ref/feature/latest/"

for commonTOC in commonTOCKeys:
    commonTOCMatchString = commonTOCs[commonTOC]
    matchingTitleTOCs = featureIndex.find_all('a', {'class': 'nav-link'}, href=re.compile(commonTOCMatchString))
    firstElement = True;
    # determine whether there are multiple versions
    if len(matchingTitleTOCs) > 1:
        # multiple versions of the same title found, create a new html from the template
        # to put the versions at the top of the page
        featureVersionTemplate  = BeautifulSoup(open('./scripts/feature-template/common-feature-content-template.html'), "html.parser")
        featureTitle = featureIndex.find('h1', {'class': 'page'})
        featureTitle.string = ''
        newTOCHref = ''
        # in reverse descending order
        matchingTOCs = matchingTitleTOCs[::-1]
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
                   newTOCHref = '/'.join(hrefSplits) + '/' + combineHtml
                   newTOCHref = '/docs/ref/feature/latest' + newTOCHref
                #    print("newTOCHref:" + newTOCHref)
                   matchingTOC['href'] = newTOCHref
                   combinedPages.append(newTOCHref)
                   hrefTag = createHrefNewTag(featureIndex, tocHref, matchingTOC.get('href'))
                #    print("matchingTOC.string: " + matchingTOC.string)
                #    print("matchingTOC.get('href'): " + matchingTOC.get('href'))
                   hrefTag.string = matchingTOC.string
                   featureTitle.append(hrefTag)
            else:
                hrefTag = createHrefNewTag(featureIndex, tocHref, matchingTOC.get('href'))
                print("appending first hrefTag: " + str(hrefTag))
                featureTitle.append(hrefTag)
                matchingTOC.parent.decompose()
            # print("featureTitle")
            # print(featureTitle)
        # write to the common version doc to a file
        # TODO Need to just write the contents of the page over itself with the title changed to add the versions
        with open('./target/jekyll-webapp/' + newTOCHref, "w") as file:            
            file.write(str(featureIndex))
        # with open('./target/jekyll-webapp/docs/ref/feature/latest/featureOverview.html', "w") as file:            
        #     file.write(str(featureIndex))
    elif len(matchingTitleTOCs) == 1:
        # single version doc is found, just strip off the version from the TOC title
        matchingTOC = matchingTitleTOCs[0]
        matchingTOC.string = commonTOC

for page in combinedPages:    
    print("page " + page)

# write the new toc to each page in the antora version
# BeautifulSoup(open('./target/jekyll-webapp/docs/ref/feature/latest/*')
# Read in the current page and write over the TOC with the removed duplicates

# write the new index.html with version control in it
# with open('./target/jekyll-webapp/docs/ref/feature/latest/featureOverview.html', "w") as file:
#     file.write(str(featureIndex))
