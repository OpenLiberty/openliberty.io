from bs4 import BeautifulSoup
from pkg_resources import parse_version
import os
import re

def getTOCVersion(tocString):
    tocSplits = tocString.split()
    docVersion = tocSplits[-1]
    if docVersion.replace('.','',1).isdigit():
        return docVersion
    else:
        return None

def createHrefNewTag(parent, tocHref, tocString):
    hrefTag = parent.new_tag('div', href=tocHref)
    hrefTag['role'] = 'button'
    hrefTag['class'] = 'feature_version'
    hrefTag['full_title'] = "{}".format(tocString)
    hrefTag['tabindex'] = '0'
    docVersion = getTOCVersion(tocString)
    if docVersion is not None:
        hrefTag.string = docVersion
    return hrefTag

featureIndex = BeautifulSoup(open('./target/jekyll-webapp/docs/ref/feature/index.html'), "html.parser")

commonTOCs = [];
# gather TOCs with version in the title
for featureTOC in featureIndex.find_all(href=True, role='button'):
    toc = featureTOC.string
    splits = toc.split()
    lastWord = splits[-1]
    # if toc title ends with version, check whether there is same toc title with different version 
    if lastWord.replace('.','',1).isdigit():
       del splits[-1]
       tocWithVersion = " ".join(splits)
       sameTOCTitleWithVersion = featureIndex.find_all(href=True, role='button', string=re.compile(tocWithVersion + ' \d+.\d+$'))
       if tocWithVersion not in commonTOCs:
           commonTOCs.append(tocWithVersion)
       
# process each TOC with version in the title
for commonTOC in commonTOCs:
    matchingTitleTOCs = featureIndex.find_all(href=True, role='button', string=re.compile(commonTOC + ' \d+.\d+$'))
    firstElement = True;
    # determine whether there are multiple versions
    if len(matchingTitleTOCs) > 1:
        # multiple versions of the same title found, create a new html from the template
        # to put the versions at the top of the page
        featureVersionTemplate  = BeautifulSoup(open('./scripts/feature-template/common-feature-content-template.html'),"html.parser")
        featureTitle = featureVersionTemplate.find(id='common_feature_title')
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
                   matchingTOC['href'] = newTOCHref
                   hrefTag = createHrefNewTag(featureVersionTemplate, tocHref, matchingTOC.string)
                   hrefTag.string = matchingTOC.string
                   featureTitle.append(hrefTag)
                   matchingTOC.string = commonTOC
            else:
                hrefTag = createHrefNewTag(featureVersionTemplate, tocHref, matchingTOC.string)
                featureTitle.append(hrefTag)
                matchingTOC.parent.decompose()
        # write to the common version doc to a file
        with open('./target/jekyll-webapp' +  newTOCHref, "w") as file:
            file.write(str(featureVersionTemplate))
    else:
        # single version doc is found, just strip off the version from the TOC title
        matchingTOC = matchingTitleTOCs[0]
        matchingTOC.string = commonTOC

# rename the original index.html and write the new index.html with version control in it
os.rename('./target/jekyll-webapp/docs/ref/feature/index.html', './target/jekyll-webapp/docs/ref/feature/index.html.orig')
with open('./target/jekyll-webapp/docs/ref/feature/index.html', "w") as file:
    file.write(str(featureIndex))
