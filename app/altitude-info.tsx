import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertTriangle, Heart, Brain, Droplets, Wind } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AltitudeInfoScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Altitude Sickness Info</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Understanding Altitude Sickness</Text>
          <Text style={styles.paragraph}>
            Altitude sickness, also known as Acute Mountain Sickness (AMS), occurs when you 
            cannot get enough oxygen from the air at high altitudes. This causes symptoms 
            such as headache, loss of appetite, and trouble sleeping.
          </Text>
          <Text style={styles.paragraph}>
            As you travel to higher altitudes, the air pressure drops and there is less 
            oxygen available. Most people can safely go up to 2,400 meters (8,000 feet) in 
            one day. Beyond that, the risk of altitude sickness increases.
          </Text>
        </View>

        {/* Types of Altitude Sickness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types of Altitude Sickness</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <AlertTriangle size={24} color="#FF385C" />
              <Text style={[styles.cardTitle, {color: '#FF385C'}]}>
                Acute Mountain Sickness (AMS)
              </Text>
            </View>
            <Text style={styles.cardContent}>
              The most common form. Symptoms are similar to a hangover - headache, nausea, 
              fatigue. Usually resolves in 1-2 days at the same altitude.
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Wind size={24} color="#FF385C" />
              <Text style={[styles.cardTitle, {color: '#FF385C'}]}>
                High Altitude Pulmonary Edema (HAPE)
              </Text>
            </View>
            <Text style={styles.cardContent}>
              Fluid in the lungs. Symptoms include extreme fatigue, breathlessness at rest, 
              cough with frothy sputum, chest tightness. Can be fatal if untreated.
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Brain size={24} color="#FF385C" />
              <Text style={[styles.cardTitle, {color: '#FF385C'}]}>
                High Altitude Cerebral Edema (HACE)
              </Text>
            </View>
            <Text style={styles.cardContent}>
              Swelling of the brain. Symptoms include confusion, difficulty walking straight, 
              severe headache, hallucinations. Medical emergency that can be fatal.
            </Text>
          </View>
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Factors</Text>
          <Text style={styles.paragraph}>
            Some people are more susceptible to altitude sickness:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Rapid ascent to high altitude</Text>
            <Text style={styles.bulletItem}>• Previous history of altitude sickness</Text>
            <Text style={styles.bulletItem}>• Physical exertion at high altitude</Text>
            <Text style={styles.bulletItem}>• Sleep medications or alcohol use</Text>
            <Text style={styles.bulletItem}>• Pre-existing heart or lung conditions</Text>
            <Text style={styles.bulletItem}>• Age (though this isn't consistently predictive)</Text>
          </View>
        </View>

        {/* Prevention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prevention</Text>
          
          <View style={styles.preventionItem}>
            <Text style={styles.preventionTitle}>Gradual Ascent</Text>
            <Text style={styles.preventionContent}>
              Ascend slowly. Above 3,000 meters, increase sleeping altitude by no more than 
              300-500 meters per day. For every 1,000 meters gained, take a rest day.
            </Text>
          </View>
          
          <View style={styles.preventionItem}>
            <Text style={styles.preventionTitle}>Stay Hydrated</Text>
            <Text style={styles.preventionContent}>
              Drink plenty of water (3-4 liters daily). Avoid alcohol and excessive caffeine, 
              which can worsen dehydration.
            </Text>
          </View>
          
          <View style={styles.preventionItem}>
            <Text style={styles.preventionTitle}>"Climb High, Sleep Low"</Text>
            <Text style={styles.preventionContent}>
              You can climb to a higher altitude during the day, but return to a lower altitude 
              to sleep. This helps your body acclimatize more effectively.
            </Text>
          </View>
          
          <View style={styles.preventionItem}>
            <Text style={styles.preventionTitle}>Medications</Text>
            <Text style={styles.preventionContent}>
              Acetazolamide (Diamox) can help prevent AMS. Consult a healthcare provider before 
              your trip about appropriate medications.
            </Text>
          </View>
        </View>

        {/* Symptoms to Watch For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms to Watch For</Text>
          
          <View style={styles.symptomsRow}>
            <View style={styles.symptomItem}>
              <Heart size={24} color="#FF385C" />
              <Text style={styles.symptomName}>Mild AMS</Text>
              <View style={styles.symptomsList}>
                <Text style={styles.symptomText}>• Headache</Text>
                <Text style={styles.symptomText}>• Fatigue</Text>
                <Text style={styles.symptomText}>• Loss of appetite</Text>
                <Text style={styles.symptomText}>• Dizziness</Text>
                <Text style={styles.symptomText}>• Nausea</Text>
                <Text style={styles.symptomText}>• Sleep disturbance</Text>
              </View>
            </View>
            
            <View style={styles.symptomItem}>
              <AlertTriangle size={24} color="#FF385C" />
              <Text style={styles.symptomName}>Severe AMS</Text>
              <View style={styles.symptomsList}>
                <Text style={styles.symptomText}>• Intense headache</Text>
                <Text style={styles.symptomText}>• Persistent vomiting</Text>
                <Text style={styles.symptomText}>• Shortness of breath</Text>
                <Text style={styles.symptomText}>• Decreased coordination</Text>
                <Text style={styles.symptomText}>• Severe fatigue</Text>
                <Text style={styles.symptomText}>• Fluid retention</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.symptomsRow}>
            <View style={styles.symptomItem}>
              <Wind size={24} color="#FF385C" />
              <Text style={styles.symptomName}>HAPE</Text>
              <View style={styles.symptomsList}>
                <Text style={styles.symptomText}>• Extreme fatigue</Text>
                <Text style={styles.symptomText}>• Breathlessness at rest</Text>
                <Text style={styles.symptomText}>• Persistent cough</Text>
                <Text style={styles.symptomText}>• Frothy sputum</Text>
                <Text style={styles.symptomText}>• Blue tinge to skin</Text>
                <Text style={styles.symptomText}>• Chest tightness</Text>
              </View>
            </View>
            
            <View style={styles.symptomItem}>
              <Brain size={24} color="#FF385C" />
              <Text style={styles.symptomName}>HACE</Text>
              <View style={styles.symptomsList}>
                <Text style={styles.symptomText}>• Confusion</Text>
                <Text style={styles.symptomText}>• Ataxia (unsteadiness)</Text>
                <Text style={styles.symptomText}>• Hallucinations</Text>
                <Text style={styles.symptomText}>• Drowsiness</Text>
                <Text style={styles.symptomText}>• Coma (severe cases)</Text>
                <Text style={styles.symptomText}>• Severe headache</Text>
              </View>
            </View>
          </View>
        </View>

        {/* What to Do */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Do if Symptoms Occur</Text>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>For Mild AMS:</Text>
            <View style={styles.actionList}>
              <Text style={styles.actionItem}>1. Stop ascending and rest</Text>
              <Text style={styles.actionItem}>2. Take pain relievers for headache</Text>
              <Text style={styles.actionItem}>3. Stay hydrated</Text>
              <Text style={styles.actionItem}>4. Consider Diamox if available</Text>
              <Text style={styles.actionItem}>5. Descend if symptoms don't improve</Text>
            </View>
          </View>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>For Severe AMS, HAPE, or HACE:</Text>
            <View style={styles.actionList}>
              <Text style={styles.actionItem}>1. Descend immediately (at least 500-1000m)</Text>
              <Text style={styles.actionItem}>2. Seek emergency medical help</Text>
              <Text style={styles.actionItem}>3. Use supplemental oxygen if available</Text>
              <Text style={styles.actionItem}>4. Use portable hyperbaric chamber if available</Text>
              <Text style={styles.actionItem}>5. Don't leave the person alone</Text>
              <Text style={styles.actionItem}>6. Evacuate to hospital as soon as possible</Text>
            </View>
          </View>
          
          <View style={styles.emergencyNote}>
            <AlertTriangle size={20} color="#FFFFFF" />
            <Text style={styles.emergencyText}>
              HACE and HAPE are medical emergencies. Immediate descent is critical and can be lifesaving.
            </Text>
          </View>
        </View>

        {/* Altitude Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Altitude Zones in Nepal</Text>
          
          <View style={styles.altitudeZone}>
            <Text style={styles.zoneTitle}>Low Altitude (below 2,500m)</Text>
            <Text style={styles.zoneContent}>
              Areas like Kathmandu, Pokhara, and the lower trails. Minimal risk of altitude sickness.
            </Text>
            <Text style={styles.zoneExamples}>
              Examples: Kathmandu (1,400m), Pokhara (800m), Chitwan (100m)
            </Text>
          </View>
          
          <View style={styles.altitudeZone}>
            <Text style={styles.zoneTitle}>Moderate Altitude (2,500m - 3,500m)</Text>
            <Text style={styles.zoneContent}>
              Popular trekking areas including parts of the Annapurna Circuit and Everest region. 
              Some risk of mild AMS.
            </Text>
            <Text style={styles.zoneExamples}>
              Examples: Namche Bazaar (3,440m), Tengboche (3,867m), Upper Pisang (3,300m)
            </Text>
          </View>
          
          <View style={styles.altitudeZone}>
            <Text style={styles.zoneTitle}>High Altitude (3,500m - 5,500m)</Text>
            <Text style={styles.zoneContent}>
              Most high mountain passes and base camps. Significant risk of AMS.
            </Text>
            <Text style={styles.zoneExamples}>
              Examples: Everest Base Camp (5,364m), Thorong La Pass (5,416m), Gokyo Ri (5,357m)
            </Text>
          </View>
          
          <View style={styles.altitudeZone}>
            <Text style={styles.zoneTitle}>Extreme Altitude (above 5,500m)</Text>
            <Text style={styles.zoneContent}>
              Mountain climbing zones. Very high risk of severe AMS, HAPE, and HACE.
            </Text>
            <Text style={styles.zoneExamples}>
              Examples: Mount Everest (8,848m), Lhotse (8,516m), Manaslu (8,163m)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF385C',
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  preventionItem: {
    marginBottom: 16,
  },
  preventionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  preventionContent: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  symptomsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  symptomItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 12,
  },
  symptomsList: {
    alignItems: 'flex-start',
    width: '100%',
  },
  symptomText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  actionList: {
    marginLeft: 4,
  },
  actionItem: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  emergencyNote: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  altitudeZone: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF385C',
    paddingLeft: 12,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  zoneContent: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  zoneExamples: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
