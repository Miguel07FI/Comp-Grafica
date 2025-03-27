#version 330 core

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Light light;
uniform Light secondLight;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 color;

uniform vec3 viewPos;
uniform Material material;
uniform sampler2D texture_diffusse;

void main()
{
    // ===== CÁLCULO DE ATENUACIÓN (solo para la luz principal) =====
    float distance = length(light.position - FragPos);
    float constant = 1.0;
    float linear = 0.05;     // más alcance
    float quadratic = 0.01;  // más alcance
    float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));

    // ===== LUZ PRINCIPAL =====

    // Luz ambiental
    vec3 ambient = light.ambient * material.ambient;

    // Luz difusa
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * material.diffuse;

    // Luz especular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    // Aplicar atenuación solo a la primera luz
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    // ===== SEGUNDA LUZ (sin atenuación, o puedes agregar si gustas) =====
    vec3 secondLightDir = normalize(secondLight.position - FragPos);
    float secondDiff = max(dot(norm, secondLightDir), 0.0);
    vec3 secondDiffuse = secondLight.diffuse * secondDiff * material.diffuse;

    vec3 secondReflectDir = reflect(-secondLightDir, norm);
    float secondSpec = pow(max(dot(viewDir, secondReflectDir), 0.0), material.shininess);
    vec3 secondSpecular = secondLight.specular * secondSpec * material.specular;

    vec3 secondAmbient = secondLight.ambient * material.ambient;

    // Resultado final
    vec3 result = ambient + diffuse + specular + secondAmbient + secondDiffuse + secondSpecular;

    color = vec4(result, 1.0f) * texture(texture_diffusse, TexCoords);
}
