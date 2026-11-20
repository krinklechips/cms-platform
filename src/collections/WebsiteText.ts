import { ValidationError, type CollectionConfig } from 'payload'
import { validateWebsiteCopy, websiteTextPage, websiteTextPages } from '../lib/website-text'

export const WebsiteText: CollectionConfig = {
  slug: 'website-text',
  labels: { singular: 'Website Text', plural: 'Pages, Menu and Footer' },
  indexes: [{ fields: ['tenant','page'], unique: true }],
  admin: {
    group: 'Website Text', useAsTitle: 'page', defaultColumns: ['page','_status','updatedAt'],
    description: 'Page introductions, shared navigation labels and footer text.',
  },
  access: { read: () => true, delete: () => false },
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (!websiteTextPage(data?.page ?? originalDoc?.page)) {
        throw new ValidationError({errors:[{path:'page',message:'Choose a website page.'}]})
      }
      if (data?.page !== undefined && originalDoc?.page && data.page !== originalDoc.page) {
        throw new ValidationError({ errors: [{ path:'page',message:'A saved text record keeps its original page.' }] })
      }
      if (data && Object.hasOwn(data, 'copy')) {
        const result = validateWebsiteCopy(data.page ?? originalDoc?.page, data.copy)
        if (result !== true) throw new ValidationError({ errors: [{ path:'copy',message:result }] })
      }
      return data
    }],
  },
  fields: [
    { name:'page',label:'Page or shared area',type:'select',required:true,access:{update:()=>false},
      options:websiteTextPages.map(({page,label})=>({value:page,label})) },
    { name:'copy',label:'Text',type:'json',localized:true,defaultValue:{},
      validate:(value,{data})=>validateWebsiteCopy((data as {page?:unknown}|undefined)?.page,value),
      admin:{components:{Field:'/components/WebsiteTextFields#WebsiteTextFields'}} },
  ],
}
