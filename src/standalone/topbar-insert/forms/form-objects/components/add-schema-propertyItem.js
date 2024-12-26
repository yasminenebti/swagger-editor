import { fromJS } from "immutable"
import { propertyItem } from "./component-schema"


export const updateSchemaPropertiesForm = (updateForm, path, existing) => fromJS({
  schemaName: {
    value: "",
    isRequired: true,
    name: "Schema Name",
    description: "Select the schema to update",
    updateForm: event => updateForm(event, path.concat(["schemaName"])),
    validationMessage: "Please select a schema",
    options: existing ? Object.keys(existing.getIn(["components", "schemas"]).toJS()) : []
  },
  newProperties: {
    value: [],
    name: "New Properties",
    description: "Add new properties to the schema",
    updateForm: newForm => updateForm(newForm, path.concat(["newProperties"])),
    defaultItem: i => propertyItem(updateForm, path.concat(["newProperties", "value", i]))
  }
})

export const updateSchemaPropertiesObject = (formData, existingSchema) => {
  const schemaName = formData.getIn(["schemaName", "value"])
  const newProperties = formData.getIn(["newProperties", "value"])
  const existingProperties = existingSchema.getIn(["components", "schemas", schemaName, "properties"]).toJS()

  newProperties.forEach(prop => {
    const propertyName = prop.getIn(["name", "value"])
    existingProperties[propertyName] = {
      type: prop.getIn(["type", "value"]),
      ...(prop.getIn(["format", "value"]) && { format: prop.getIn(["format", "value"]) }),
      ...(prop.getIn(["description", "value"]) && { description: prop.getIn(["description", "value"]) }),
      ...(prop.getIn(["example", "value"]) && { example: formatExampleValue(prop) }),
      ...(prop.getIn(["enum", "value"]) && {
        enum: prop.getIn(["enum", "value"])
          .split(",")
          .map(v => v.trim())
          .filter(v => v.length > 0)
      })
    }
  })

  return {
    key: schemaName,
    value: {
      ...existingSchema.getIn(["components", "schemas", schemaName]).toJS(),
      properties: existingProperties
    }
  }
}

const formatExampleValue = (prop) => {
  const value = prop.getIn(["example", "value"])
  switch (prop.getIn(["type", "value"])) {
    case 'integer':
    case 'number':
      return Number(value)
    case 'boolean':
      return value.toLowerCase() === 'true'
    default:
      return value
  }
}
