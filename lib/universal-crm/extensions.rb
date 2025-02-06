# frozen_string_literal: true

class String
  def hideQuotedLines
    s = gsub("\r", '')
    lines = s.split("\n")
    new_string = ''
    lines.each do |line|
      new_string += if line[0, 1] == '>'
                      '.'
                    else
                      "#{line}\r\n"
                    end
    end
    new_string
  end
end
