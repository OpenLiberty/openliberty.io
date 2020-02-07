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
    print("tocHref: " + tocHref)
    print("tocString: " + tocString)
    hrefTag = parent.new_tag('div', href=tocHref)
    hrefTag['role'] = 'button'
    hrefTag['class'] = 'feature_version'
    # print("Display string is: " + "{}".format(tocString))
    hrefTag['full_title'] = "{}".format(tocString)
    hrefTag['tabindex'] = '0'
    docVersion = getTOCVersion(tocString)
    if docVersion is not None:
        print("Setting display string to: " + docVersion)
        hrefTag.string = docVersion
    else: 
        print("No doc version")
    return hrefTag

# rename the original index.html
# os.rename('./target/jekyll-webapp/docs/build/site/feature/latest/featureOverview.html', './target/jekyll-webapp/docs/build/site/feature/latest/featureOverview.html.orig')

featureIndex = BeautifulSoup(open('./target/jekyll-webapp/docs/ref/feature/latest/featureOverview.html'), "html.parser")

# Keep track of new href with updated versions to update the TOCs later
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

# Add to version href if we need it for linking
antora_path = "target/jekyll-webapp/docs/ref/feature/latest/"

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
                   newTOCHref = '/'.join(hrefSplits) + combineHtml
                #    newTOCHref = '/docs/ref/feature/latest' + newTOCHref
                #    print("newTOCHref:" + newTOCHref)
                   matchingTOC['href'] = newTOCHref
                   hrefTag = createHrefNewTag(featureIndex, tocHref, matchingTOC.get('href'))
                #    print("Setting display string to: " + matchingTOC.string) # This one is ok it is the combined toc
                   hrefTag.string = matchingTOC.string
                   featureTitle.append(hrefTag)
            else:
                hrefTag = createHrefNewTag(featureIndex, tocHref, matchingTOC.get('href'))
                featureTitle.append(hrefTag)
                matchingTOC.parent.decompose()
        # write to the common version doc to a file
        with open('./target/jekyll-webapp/docs/ref/feature/latest/' + newTOCHref, "w") as file:            
            file.write(str(featureIndex))

# record the toc in the featureIndex
combinedTOC = featureIndex.find_all('ul', {'class': 'nav-list'})[1]

for file_name in os.listdir(antora_path):
    href = antora_path + file_name
    page = BeautifulSoup(open(href), "html.parser")
    # Find the toc and replace it with the modified toc
    toc = page.find_all('ul', {'class': 'nav-list'})[1]
    toc.clear()
    toc.append(combinedTOC)
    with open(href, "w") as file:            
            file.write(str(page))
    
