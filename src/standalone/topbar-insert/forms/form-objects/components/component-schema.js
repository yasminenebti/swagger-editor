import { fromJS } from "immutable"

export const schemaForm = (updateForm, path) => fromJS({
  name: {
    value: "",
    isRequired: true,
    name: "Schema Name",
    description: "Name of the schema definition",
    updateForm:event => updateForm(event, path.concat(["name"])),
    validationMessage: "Please make sure to be a capitalized Schema .",
  },
  properties: {
    value: [],
    name: "Properties",
    description: "Schema properties",
    updateForm: newForm => updateForm(newForm, path.concat(["properties"])),
    defaultItem: i => propertyItem(updateForm, path.concat(["properties", "value", i]))
  },
})


export const propertyItem = (updateForm, path) => fromJS({
  name: {
    value: "",
    isRequired: true,
    name: "Property Name",
    description: "Name of the property",
    updateForm: event => updateForm(event, path.concat(["name"]))
  },
  type: {
    value: "",
    isRequired: true,
    name: "Type",
    description: "Data type of the property",
    options: ["string", "number", "integer", "boolean", "array", "object"],
    updateForm: event => updateForm(event, path.concat(["type"]))
  },
  format: {
    value: "",
    name: "Format",
    description: "Extended format (e.g. int64, date-time)",
    options: ["int32", "int64", "float", "double", "date", "date-time", "email", "uuid"],
    updateForm: event => updateForm(event, path.concat(["format"]))
  },
  description: {
    value: "",
    name: "Description",
    description: "Property description",
    updateForm: event => updateForm(event, path.concat(["description"]))
  },
  example: {
    value: "",
    name: "Example",
    description: "Example value",
    updateForm: event => updateForm(event, path.concat(["example"]))
  },
  enum: {
    value: "",
    name: "Enum Values",
    description: "Comma-separated enum values",
    updateForm: event => updateForm(event, path.concat(["enum"]))
  }
})

export const schemaObject = (formData) => {
  const schemaProperties = formData.getIn(["properties", "value"])
  const schemaName = formData.getIn(["name", "value"])
  const properties = {}
  const required = []

  if (schemaProperties && schemaProperties.size > 0) {
    schemaProperties.forEach(prop => {
      const propertyName = prop.getIn(["name", "value"])
      const property = {
        type: prop.getIn(["type", "value"])
      }

      if (prop.getIn(["format", "value"])) {
        property.format = prop.getIn(["format", "value"])
      }

      if (prop.getIn(["description", "value"])) {
        property.description = prop.getIn(["description", "value"])
      }

      if (prop.getIn(["example", "value"])) {
        const exampleValue = prop.getIn(["example", "value"])
        switch (property.type) {
          case 'integer':
          case 'number':
            property.example = Number(exampleValue)
            break
          case 'boolean':
            property.example = exampleValue.toLowerCase() === 'true'
            break
          default:
            property.example = exampleValue
        }
      }

      if (prop.getIn(["enum", "value"])) {
        property.enum = prop.getIn(["enum", "value"])
          .split(",")
          .map(v => v.trim())
          .filter(v => v.length > 0)
      }
      properties[propertyName] = property
    })
  }

  const newSchema = {
    key: schemaName,
    value: {
      type: "object",
      xml: {
        name: schemaName
      },
      properties: properties
    }
  }

  if (required.length > 0) {
    newSchema.value.required = required
  }

  return newSchema
}

