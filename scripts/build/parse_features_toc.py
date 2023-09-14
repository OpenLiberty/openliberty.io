from bs4 import BeautifulSoup
from pkg_resources import parse_version
import os
import os.path as path
import fnmatch
import re
import time

SORT_HIGH_TO_LOW = True

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

def get_feature_version(htmlElement):
    href_value = htmlElement.get('href')
    # Look for n.n, where n is one or more digits
    regex_for_decimal_num = r"\d+\.*\d+"
    feature_version_number = re.findall(regex_for_decimal_num, href_value)
    if len(feature_version_number) == 0:
        # SPECIAL CASE HANDLING
        # In 20.0.0.9 feature documentation, there are two entries that are NOT features. These
        # links take the user to a page outside of the feature pages! This means these links have no
        # concept of feature versions! We must skip these pages!
        # Two pages are have href like so
        #   href="../fault-tolerance-1-dif.html"
        #   href="../metrics-1-dif.html"
        print("Special case handling for page: " + href_value)
        return 1 # returning 1 should result in sort effectively do nothing due to having no feature versions
    feature_version_number = feature_version_number[0]
    feature_version_number = float(feature_version_number)
    return feature_version_number

# This method will sort the feature by their versions
def sort_versions_for(feature, high_to_low=True):
    feature.sort(key=lambda x: get_feature_version(x), reverse=high_to_low)

timerStart = time.time()

# Get all of the Antora versions
# featurePath = 'target/jekyll-webapp/docs/'
# new path src/main/content/docs/build/site/
featurePath = 'srcmain/content/docs/build/site/docs/'


versions = []
for version in os.listdir(featurePath):
    reference_directory_path = featurePath + version + "/reference/"
    if(path.isdir(reference_directory_path)):
        for file in os.listdir(reference_directory_path):
            if file == "feature":
                if version != "modules":
                    versions.append(version)

print("Documentation found for these Liberty versions: ")
print(" ".join([str(x) for x in versions]))

# Only process the features of the highest version for the docs draft site
if(os.getenv("DRAFT_SITE") or os.getenv("DOCS_DRAFT_SITE")):
    # Here the below code is commented out with the older version of antora we need to find the highest version and setting as max
    # With update of antora adding latest_version_segment param in antora-playbook.yml in docs-playbook repo the highest version will be automatically converted from numerical to symbolic version ie; latest
    # max = ['0', '0', '0', '0']
    # for version in versions:
    #     nums = version.split('.')
    #     if(int(nums[0]) > int(max[0])):
    #         max = nums
    #     elif(int(nums[0]) == int(max[0]) and int(nums[3]) > int(max[3])):
    #         max = nums
    # max = '.'.join(max)
    max = 'latest'
    print("Processing only version: " + max + " for the docs draft site.")
    versions = [max]



# Loop through each Antora version to fix its feature TOC and combine the pages
for version in versions:
    print("Processing version: " + version)
    # Read in front version/feature but write to all of the antora version later for changing the toc
    antora_path = featurePath + version + "/reference/"
    featureIndex = BeautifulSoup(open(antora_path + 'feature/feature-overview.html'), "lxml")        

    if version != 'latest':
        version_split = version.split('.')
        year = int(version_split[0])
        month = int(version_split[3])
        process_jakarta_features =  year > 21 or (year == 21 and month == 12)
    if version == 'latest':
        process_jakarta_features = True

    # Keep track of new href with updated versions to update the TOCs later
    commonTOCs = {}

    # gather TOCs with version in the title
    # Find TOC then find the feature section
    toc = featureIndex.find('nav', {'class': 'nav-menu'})
    if toc.find('span', text='Features') is not None:
        featureDropdown = toc.find('span', text='Features').parent
    elif toc.find('a', text='Features') is not None:
        featureDropdown = toc.find('a', text='Features').parent

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

    java_to_jakarta_feature_mapping = [("ejb","enterpriseBeans"),
        ("ejbHome", "enterpriseBeansHome"),
        ("ejbLite", "enterpriseBeansLite"),
        ("ejbPersistentTimer", "enterpriseBeansPersistentTimer"),
        ("ejbRemote", "enterpriseBeansRemote"),
        ("el", "expressionLanguage"),
        ("jacc", "appAuthorization"),
        ("javaeeClient", "jakartaeeClient"),
        ("jaspic", "appAuthentication"),
        ("javaMail", "mail"),
        ("jaxb", "xmlBinding"),
        ("jaxrs", "restfulWS"),
        ("jaxrsClient", "restfulWSClient"),
        ("jaxws", "xmlWS"),
        ("jca", "connectors"),
        ("jcaInboundSecurity", "connectorsInboundSecurity"),
        ("jms", "messaging"),
        ("jpa", "persistence"),
        ("jpaContainer", "persistenceContainer"),
        ("jsf", "faces"),
        ("jsfContainer", "facesContainer"),
        ("jsp", "pages"),
        ("wasJmsClient", "messagingClient"),
        ("wasJmsSecurity", "messagingSecurity"),
        ("wasJmsServer", "messagingServer")]

    # Make sure all Jakarta EE feature names in the mapping are in the list of commonTOC so they get combined later.
    if process_jakarta_features:
        for mapping in java_to_jakarta_feature_mapping:
            java_feature_name = mapping[0]
            jakarta_feature_name = mapping[1]
            if java_feature_name + '.html' in commonTOCKeys:
                print("Removing " + java_feature_name + " from the table of content due to it having a new feature name " + jakarta_feature_name)
                del commonTOCs[java_feature_name + '.html']
            if jakarta_feature_name + '.html' not in commonTOCKeys:
                commonTOCs[jakarta_feature_name + '.html'] = '^' + jakarta_feature_name + '-\\d+[.]?\\d*.html$'

    commonTOCKeys = commonTOCs.keys()
    commonTOCKeys = list(commonTOCKeys)

    TOCToDecompose = []
    for commonTOC in commonTOCKeys:
        commonTOCMatchString = commonTOCs[commonTOC]
        # Look for all the versions of a particular feature name. This is similar to doing:
        # find . -name "webProfile*.html"
        matchingTitleTOCs = featureIndex.find_all('a', {'class': 'nav-link'}, href=re.compile(commonTOCMatchString))

        if process_jakarta_features:
            # Check for old Java features here and concat them to the list of Jakarta matches
            for mapping in java_to_jakarta_feature_mapping:
                jakarta_feature_name = mapping[1]
                if jakarta_feature_name + '.html' == commonTOC:
                    # Get the Java equivalent
                    java_name = mapping[0]
                    java_regex = '^' + java_name + '-\\d+[.]?\\d*.html$'
                    matching_java_tocs = featureIndex.find_all('a', {'class': 'nav-link'}, href=re.compile(java_regex))
                    # Add in reversed order to the list of Jakarta feature versions
                    for java_toc in matching_java_tocs[::-1]:
                        matchingTitleTOCs.insert(0, java_toc) # Prepend
                        TOCToDecompose.append(java_toc.parent)

        # Collected all the versions for a particular feature, now sort the list from highest
        # to lowest version number.

        firstElement = True;
        # determine whether there are multiple versions
        firstHref = matchingTitleTOCs[0].get('href')
        featurePage  = BeautifulSoup(open(antora_path + '/feature/' + firstHref), "lxml")
        pageTitle = featurePage.find('h1', {'class': 'page'})
        titleDiv = featurePage.new_tag('div', id='feature_name')
        versionDiv = featurePage.new_tag('div', id='feature_versions')
        pageTitle.string = ''
        newTOCHref = ''
        sort_versions_for(matchingTitleTOCs, SORT_HIGH_TO_LOW)
        for matchingTOC in matchingTitleTOCs:
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
        for matchingTOC in matchingTitleTOCs:
            # Open page and rewrite the version part
            versionHref = antora_path + 'feature/' + matchingTOC.get('href')
            versionPage = BeautifulSoup(open(versionHref), "lxml")
            versionTitle = versionPage.find('h1', {'class': 'page'})
            # Get the matchingTOC's string and write it over the shared title of this feature version
            if versionTitle is not None:
                versionTitle.replace_with(pageTitle)
            displayTitle = versionPage.find('div', {'id': 'feature_name_string'})
            if displayTitle is not None and len(displayTitle) > 0:
                displayTitle.string = matchingTOC.string
                displayTitle['full_title'] = "{}".format(matchingTOC.string)
                displayTitle['aria-label'] = "{}".format(matchingTOC.string)
            with open(versionHref, "w") as file:
                file.write(str(versionPage))

    for TOC in TOCToDecompose:
        TOC.decompose()

    # Remove .is-current-page so they don't show up as highlighted in other types of docs
    tocs = featureIndex.find_all('li', {'class':'is-current-page'})
    for toc in tocs:
        toc['class'] = 'nav-item'

    # Sort features list alphabetically ignoring case
    ul = featureDropdown.find(attrs={"class": "nav-list"})
    features = [li.extract() for li in ul.find_all('li', {'class': 'nav-item'})]
    features.sort(key=lambda e: e.find(attrs={"class": "nav-link"}).string.lower())
    for linebreak, li in reversed(list(zip(ul.contents, features))):
     linebreak.insert_after(li)

    # Write the new TOC to the feature-overview.html with version control in it
    with open(antora_path + 'feature/feature-overview.html', "w") as file:
        file.write(str(featureIndex))

    # Record the toc in the featureIndex to write over the other pages
    featureIndex = BeautifulSoup(open(antora_path + 'feature/feature-overview.html'), "lxml")
    toc = featureIndex.find_all('ul', {'class': 'nav-list'})[0]
    if toc.find('span', text='Features') is not None:
        featureTOC = toc.find('span', text='Features').parent
    elif toc.find('a', text='Features') is not None:
        featureTOC = toc.find('a', text='Features').parent

    # Change hrefs to full path so the links work from other doc pages
    for feature in featureTOC.find_all('a', {'class': 'nav-link'}, href=True):
        fullHref = '/docs/' + version + '/reference/feature/' + feature.get('href')
        feature['href'] = fullHref

    # Write the reduced feature TOC of all of the Antora doc pages in this version
    print("Modifying the docs TOCs of version " + version + " to remove the duplicate feature versions.")
    feature_version_path = featurePath + version
    for root, dirs, files in os.walk(feature_version_path):
        for basename in files:
            if fnmatch.fnmatch(basename, "*.html"):
                if(basename != "index.html"):
                    href = path.join(root, basename)
                    page = BeautifulSoup(open(href), "lxml")

                    # Find the toc and replace it with the modified toc
                    page_toc = page.find_all('ul', {'class': 'nav-list'})[0]
                    if page_toc.find('span', text='Features') is not None:
                        toc_to_replace = page_toc.find('span', text='Features').parent
                    elif page_toc.find('a', text='Features') is not None:
                        toc_to_replace = page_toc.find('a', text='Features').parent
                    toc_to_replace.clear()
                    toc_to_replace.append(featureTOC)
                    with open(href, "w") as file:
                        file.write(str(page))

timerEnd = time.time()
print('Total execution time for parsing ToC Features: ', timerEnd - timerStart)
