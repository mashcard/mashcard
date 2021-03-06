# frozen_string_literal: true

module Types
  class Locale < BaseEnum
    description 'Represents all IETF BCP47 standard codes supported by the server.'

    Mashcard::I18n::AVAILABLE_LANGUAGES.to_a.map do |i|
      value(i[0].to_s.upcase.tr('-', '_'), i[1], value: i[0])
    end
  end
end
