@@ .. @@
                 <div>
                   <label className="block text-sm font-semibold text-neutral-700 mb-2">
                     Content ({getLanguageName(translation.language_code)}) *
                   </label>
                   <UnifiedRichTextEditor
                     value={formData.content}
                     onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                     placeholder={`Write content in ${getLanguageName(translation.language_code)}...`}
                   />
                 </div>