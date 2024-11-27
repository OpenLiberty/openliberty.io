timer_start=$(date +%s)
modifyStylesheet () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc subdirectories
    cat src/main/content/antora_ui/src/css/javadoc-extended-stylesheet.css >> "$1"

    # insert extra import to the beginning of the file
    echo '@font-face {
        font-family: "Asap";
        font-style: normal;
        font-stretch: 100%;
        src: url("../../../../fonts/Asap.woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }' | cat - "$1" > newstylesheet.css

    mv newstylesheet.css "$1"
}

modifyStylesheetFrameless () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc api/spi subdirectories
    cat src/main/content/antora_ui/src/css/javadoc-extended-stylesheet-frameless.css >> "$1"

    # insert extra import to the beginning of the file
    echo '@font-face {
        font-family: "Asap";
        font-style: normal;
        font-stretch: 100%;
        src: url("../../../../fonts/Asap.woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }' | cat - "$1" > newstylesheet.css
    
    mv newstylesheet.css "$1"
}

modifyStylesheetFramelessSPIAPI () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc api/spi subdirectories
    cat src/main/content/antora_ui/src/css/javadoc-extended-stylesheet-frameless-api_spi.css >> "$1"

    # insert extra import to the beginning of the file
    echo '@font-face {
        font-family: "Asap";
        font-style: normal;
        font-stretch: 100%;
        src: url("../../../../../fonts/Asap.woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }' | cat - "$1" > newstylesheet.css
    
    mv newstylesheet.css "$1"
}

modifySearch () {
    # add url support to search
    cp src/main/content/_assets/js/javadoc-search.js "$1"
}

modifyFramelessSearch () {
    # add url support to frameless javadoc search
    cp src/main/content/_assets/js/javadoc-search-frameless.js "$1"
}

modifyRedirect () {
    a=$1
    cp src/main/content/_assets/js/javadoc-redirect.js "${a/script.js/redirect.js}"
    sed '39 i\
    createElem(doc, tag, "redirect.js");' "$1" > newscript.js
    mv newscript.js "$1"
}

export -f modifyStylesheet
export -f modifyStylesheetFrameless
export -f modifyStylesheetFramelessSPIAPI
export -f modifySearch
export -f modifyFramelessSearch
export -f modifyRedirect

find target/jekyll-webapp/docs -path "*liberty-*/stylesheet.css" -exec bash -c 'modifyStylesheetFrameless {}' \;
find target/jekyll-webapp/docs -path "*microprofile*/stylesheet.css" -exec bash -c 'modifyStylesheetFrameless {}' \;
find target/jekyll-webapp/docs -path "*io.openliberty*/stylesheet.css" -exec bash -c 'modifyStylesheetFramelessSPIAPI {}' \;
find target/jekyll-webapp/docs -path "*com.ibm.websphere.appserver*/stylesheet.css" -exec bash -c 'modifyStylesheetFramelessSPIAPI {}' \;
find target/jekyll-webapp/docs -path "*microprofile*" -name search.js -exec bash -c 'modifyFramelessSearch {}' \;
find target/jekyll-webapp/docs -path "*liberty-*" -name search.js -exec bash -c 'modifyFramelessSearch {}' \;
find target/jekyll-webapp/docs -name script.js  -exec bash -c 'modifyRedirect {}' \;

timer_end=$(date +%s)
echo "Total execution time for modifying the javadoc: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"