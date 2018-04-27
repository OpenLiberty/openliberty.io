require 'asciidoctor'
require 'asciidoctor/extensions'

class FeatureLinkMacro < Asciidoctor::Extensions::InlineMacroProcessor
  use_dsl
  named :feature

  def process parent, target, attrs

    (create_anchor parent, target, type: :link, target: target + ".html").convert
  end
end

class ConfigLinkMacro < Asciidoctor::Extensions::InlineMacroProcessor
  use_dsl
  named :config

  def process parent, target, attrs
    (create_anchor parent, target, type: :link, target: "../config/" + target + ".html").convert
  end
end

class JavadocLinkMacro < Asciidoctor::Extensions::InlineMacroProcessor
  use_dsl
  named :javadoc

  def process parent, target, attrs
    target
  end
end

Asciidoctor::Extensions.register do
  inline_macro FeatureLinkMacro
  inline_macro ConfigLinkMacro
  inline_macro JavadocLinkMacro
end
