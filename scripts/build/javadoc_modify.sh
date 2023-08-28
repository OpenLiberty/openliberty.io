timer_start=$(date +%s)
modifyStylesheet () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc subdirectories
    cat src/main/content/antora_ui/src/css/javadoc-extended-stylesheet.css >> "$1"

    # insert extra import to the beginning of the file
    sed '1 i\
    @import url("https://fonts.googleapis.com/css?family=Asap:300,400,500");
    ' "$1" > newstylesheet.css

    mv newstylesheet.css "$1"
}

modifyStylesheetFrameless () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc api/spi subdirectories
    cat src/main/content/antora_ui/src/css/javadoc-extended-stylesheet-frameless.css >> "$1"

    # insert extra import to the beginning of the file
    sed '1 i\
    @import url("https://fonts.googleapis.com/css?family=Asap:300,400,500");
    ' "$1" > newstylesheet.css
    
    mv newstylesheet.css "$1"
}

modifySearch () {
    # add url support to search
    cp src/main/content/_assets/js/javadoc-search.js "$1"
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
export -f modifySearch
export -f modifyRedirect

find src/main/content/docs-javadoc/modules -path "*microprofile*/stylesheet.css" -exec bash -c 'modifyStylesheet {}' \;
find src/main/content/docs-javadoc/modules -path "*liberty-*/stylesheet.css" -exec bash -c 'modifyStylesheet {}' \;
find src/main/content/docs-javadoc/modules -path "*io.openliberty*/stylesheet.css" -exec bash -c 'modifyStylesheetFrameless {}' \;
find src/main/content/docs-javadoc/modules -path "*com.ibm.websphere.appserver*/stylesheet.css" -exec bash -c 'modifyStylesheetFrameless {}' \;
find src/main/content/docs-javadoc/modules -name search.js  -exec bash -c 'modifySearch {}' \;
find src/main/content/docs-javadoc/modules -name script.js  -exec bash -c 'modifyRedirect {}' \;

timer_end=$(date +%s)
echo "Total execution time for modifying the javadoc: '$(date -u --date @$(( $timer_end - $timer_start )) +%H:%M:%S)'"